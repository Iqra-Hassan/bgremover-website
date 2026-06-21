import { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import { dataUrlToFile } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/data/constans';
import { useAuth } from '@/components/auth-provider';
import { apiClient } from '@/lib/api-client';
import { localDB } from '@/lib/services/local-db';

const eraseObjectClient = (imageSrc: string, maskDataUrl: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const maskImg = new Image();
    let loadedCount = 0;

    const onLoad = () => {
      loadedCount++;
      if (loadedCount === 2) {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }

          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          const maskCanvas = document.createElement('canvas');
          maskCanvas.width = img.width;
          maskCanvas.height = img.height;
          const maskCtx = maskCanvas.getContext('2d');
          if (!maskCtx) {
            reject(new Error('Mask canvas context not available'));
            return;
          }

          maskCtx.drawImage(maskImg, 0, 0, img.width, img.height);
          const maskData = maskCtx.getImageData(0, 0, canvas.width, canvas.height);

          const pixels = imgData.data;
          const maskPixels = maskData.data;
          const w = canvas.width;
          const h = canvas.height;

          // Identify masked pixels (where brush drawing exists)
          const isMasked = new Uint8Array(w * h);
          for (let i = 0; i < maskPixels.length; i += 4) {
            const alpha = maskPixels[i + 3];
            if (alpha > 10) {
              isMasked[i / 4] = 1;
            }
          }

          // Heal masked pixels by searching for nearest non-masked boundary pixels
          const getNearestNonMaskedColor = (startX: number, startY: number): { r: number; g: number; b: number } | null => {
            const maxRadius = Math.min(60, Math.max(w, h));
            for (let r = 1; r < maxRadius; r++) {
              for (let dx = -r; dx <= r; dx++) {
                for (let dy = -r; dy <= r; dy++) {
                  if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
                  const x = startX + dx;
                  const y = startY + dy;
                  if (x >= 0 && x < w && y >= 0 && y < h) {
                    const idx = y * w + x;
                    if (isMasked[idx] === 0) {
                      const pIdx = idx * 4;
                      return {
                        r: pixels[pIdx],
                        g: pixels[pIdx + 1],
                        b: pixels[pIdx + 2],
                      };
                    }
                  }
                }
              }
            }
            return null;
          };

          const newPixels = new Uint8Array(pixels);

          for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
              const idx = y * w + x;
              if (isMasked[idx] === 1) {
                const color = getNearestNonMaskedColor(x, y);
                if (color) {
                  const pIdx = idx * 4;
                  newPixels[pIdx] = color.r;
                  newPixels[pIdx + 1] = color.g;
                  newPixels[pIdx + 2] = color.b;
                  newPixels[pIdx + 3] = 255;
                }
              }
            }
          }

          // Apply a gentle box blur to the healed pixels to blend them in
          for (let pass = 0; pass < 2; pass++) {
            for (let y = 1; y < h - 1; y++) {
              for (let x = 1; x < w - 1; x++) {
                const idx = y * w + x;
                if (isMasked[idx] === 1) {
                  let rSum = 0, gSum = 0, bSum = 0, count = 0;
                  const neighbors = [
                    idx,
                    idx - 1,
                    idx + 1,
                    idx - w,
                    idx + w
                  ];
                  for (const nIdx of neighbors) {
                    const pIdx = nIdx * 4;
                    rSum += newPixels[pIdx];
                    gSum += newPixels[pIdx + 1];
                    bSum += newPixels[pIdx + 2];
                    count++;
                  }
                  const pIdx = idx * 4;
                  newPixels[pIdx] = Math.round(rSum / count);
                  newPixels[pIdx + 1] = Math.round(gSum / count);
                  newPixels[pIdx + 2] = Math.round(bSum / count);
                }
              }
            }
          }

          for (let i = 0; i < pixels.length; i++) {
            pixels[i] = newPixels[i];
          }

          ctx.putImageData(imgData, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert canvas to blob'));
            }
          }, 'image/png');
        } catch (err) {
          reject(err);
        }
      }
    };

    img.crossOrigin = 'anonymous';
    maskImg.crossOrigin = 'anonymous';
    img.onload = onLoad;
    maskImg.onload = onLoad;
    img.onerror = (e) => reject(new Error('Failed to load original image'));
    maskImg.onerror = (e) => reject(new Error('Failed to load mask image'));
    img.src = imageSrc;
    maskImg.src = maskDataUrl;
  });
};

export const useEraser = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [mask, setMask] = useState<string | null>(null);
  const [superErase, setSuperErase] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [brushSize, setBrushSize] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [openLoginDialog, setOpenLoginDialog] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  const { data: credits } = useQuery({
    queryKey: [queryKeys.credits],
    queryFn: async () => {
      const response = await apiClient.api.users.credits.$get();

      const result = await response.json();
      if (!response.ok) {
        const error = result as unknown as { message?: string };
        throw new Error(error?.message || 'Failed to fetch credits');
      }

      return result.credits;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [file]);

  const handleStartOver = () => {
    setFile(null);
    setPreviewImage(null);
    setMask(null);
    setResultImage(null);
    setIsLoading(false);
  };

  const handleRemoveObject = async () => {
    if ((!file && !previewImage) || !mask) {
      toast.error('Please select an image and mask');
      return;
    }

    setIsLoading(true);
    setProgress(0);
    const formData = new FormData();

    if (file) {
      formData.append('image', file);
    } else if (previewImage) {
      formData.append('imageUrl', previewImage);
    }

    const maskFile = await dataUrlToFile(mask, 'mask.png');
    formData.append('mask', maskFile);
    formData.append('isPro', superErase.toString());

    try {
      const response = await axios.post('/api/common/remove-object', formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setProgress(progress);
        },
      });
      const outputUrl = response.data.outputUrl;
      if (outputUrl) {
        setResultImage(outputUrl);
        setPreviewImage(outputUrl);
        setFile(null);
      } else {
        throw new Error('No outputUrl returned from backend');
      }
      queryClient.invalidateQueries({ queryKey: [queryKeys.credits] });
    } catch (error) {
      console.warn('Backend object remover failed, falling back to client-side...', error);
      toast.info('Using browser-based content healing (no server required)');
      
      try {
        // Resolve original image source url
        const imageSrc = previewImage || (file ? URL.createObjectURL(file) : '');
        if (!imageSrc) {
          throw new Error('No valid input image source');
        }

        const resultBlob = await eraseObjectClient(imageSrc, mask);
        
        // Save to local IndexedDB history
        const id = Math.random().toString(36).substring(7);
        const inputFile = file ? (file as Blob) : (await fetch(imageSrc).then(r => r.blob()));
        await localDB.saveHistory(id, inputFile, resultBlob, maskFile);
        
        const outputUrl = URL.createObjectURL(resultBlob);
        setResultImage(outputUrl);
        setPreviewImage(outputUrl);
        setFile(null);
        toast.success('Objects erased successfully in-browser!');
      } catch (clientError: any) {
        console.error('Client-side object erasing failed:', clientError);
        toast.error(clientError?.message || 'Failed to erase objects client-side');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (superErase && !user) {
      setOpenLoginDialog(true);
      setSuperErase(false);
    } else if (superErase && !credits) {
      setShowPricing(true);
      setSuperErase(false);
    }
  }, [superErase, user, credits]);

  return {
    file,
    setFile,
    previewImage,
    setPreviewImage,
    tool,
    setTool,
    brushSize,
    setBrushSize,
    superErase,
    setSuperErase,
    mask,
    setMask,
    handleStartOver,
    handleRemoveObject,
    isLoading,
    resultImage,
    progress,
    openLoginDialog,
    setOpenLoginDialog,
    showPricing,
    setShowPricing,
  };
};
