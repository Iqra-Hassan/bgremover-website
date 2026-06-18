import { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import { dataUrlToFile } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/data/constans';
import { useAuth } from '@/components/auth-provider';
import { apiClient } from '@/lib/api-client';

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
        toast.error('Failed to remove object');
      }
      queryClient.invalidateQueries({ queryKey: [queryKeys.credits] });
    } catch (error) {
      const errorMessage =
        error instanceof AxiosError ? error?.response?.data?.message : 'Failed to remove object';
      toast.error(errorMessage);
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
