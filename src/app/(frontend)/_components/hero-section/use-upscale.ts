import { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/data/constans';
import { useAuth } from '@/components/auth-provider';
import { apiClient } from '@/lib/api-client';
import { localDB } from '@/lib/services/local-db';

const upscaleImageClient = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width * 2;
        canvas.height = img.height * 2;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Apply a gentle sharpening convolution filter to make upscaling crisp
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imgData.data;
        const w = canvas.width;
        const h = canvas.height;
        const output = ctx.createImageData(w, h);
        const outPixels = output.data;

        // Initialize outPixels with original pixels
        for (let i = 0; i < pixels.length; i++) {
          outPixels[i] = pixels[i];
        }

        // Sharpen kernel:
        //  0  -0.3  0
        // -0.3 2.2 -0.3
        //  0  -0.3  0
        const weights = [
          0, -0.3, 0,
          -0.3, 2.2, -0.3,
          0, -0.3, 0
        ];

        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            let r = 0, g = 0, b = 0;
            for (let ky = -1; ky <= 1; ky++) {
              for (let kx = -1; kx <= 1; kx++) {
                const pIdx = ((y + ky) * w + (x + kx)) * 4;
                const wIdx = (ky + 1) * 3 + (kx + 1);
                const weight = weights[wIdx];
                r += pixels[pIdx] * weight;
                g += pixels[pIdx + 1] * weight;
                b += pixels[pIdx + 2] * weight;
              }
            }
            const outIdx = (y * w + x) * 4;
            outPixels[outIdx] = Math.max(0, Math.min(255, r));
            outPixels[outIdx + 1] = Math.max(0, Math.min(255, g));
            outPixels[outIdx + 2] = Math.max(0, Math.min(255, b));
          }
        }

        ctx.putImageData(output, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        }, 'image/png');
      } catch (err) {
        reject(err);
      } finally {
        URL.revokeObjectURL(img.src);
      }
    };
    img.onerror = (e) => reject(new Error('Failed to load image for upscaling'));
  });
};

export const useUpscale = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [superUpscale, setSuperUpscale] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
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
    setResultImage(null);
    setIsLoading(false);
  };

  const handleRemoveObject = async () => {
    if (!file) {
      toast.error('Please select an image');
      return;
    }

    setIsLoading(true);
    setProgress(0);
    const formData = new FormData();

    formData.append('image', file);

    formData.append('isPro', superUpscale.toString());

    try {
      const response = await axios.post('/api/common/upscale-image', formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setProgress(progress);
        },
      });
      const outputUrl = response.data.outputUrl;
      if (outputUrl) {
        setResultImage(outputUrl);
        setPreviewImage(outputUrl);
      } else {
        throw new Error('No outputUrl returned from backend');
      }
      queryClient.invalidateQueries({ queryKey: [queryKeys.credits] });
    } catch (error) {
      console.warn('Backend upscale failed, falling back to client-side...', error);
      toast.info('Using browser-based image scaling & sharpening (no server required)');
      
      try {
        const resultBlob = await upscaleImageClient(file);
        
        // Save to local IndexedDB history
        const id = Math.random().toString(36).substring(7);
        await localDB.saveHistory(id, file, resultBlob);
        
        const outputUrl = URL.createObjectURL(resultBlob);
        setResultImage(outputUrl);
        setPreviewImage(outputUrl);
        toast.success('Image upscaled successfully in-browser!');
      } catch (clientError: any) {
        console.error('Client-side upscale failed:', clientError);
        toast.error(clientError?.message || 'Failed to upscale image client-side');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (superUpscale && !user) {
      setOpenLoginDialog(true);
      setSuperUpscale(false);
    } else if (superUpscale && !credits) {
      setShowPricing(true);
      setSuperUpscale(false);
    }
  }, [superUpscale, user, credits]);

  return {
    file,
    setFile,
    previewImage,
    setPreviewImage,
    superUpscale,
    setSuperUpscale,
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
