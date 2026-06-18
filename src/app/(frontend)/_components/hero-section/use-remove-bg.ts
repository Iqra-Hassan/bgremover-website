import { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/data/constans';
import { useAuth } from '@/components/auth-provider';
import { apiClient } from '@/lib/api-client';

export const useRemoveBg = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [superErase, setSuperErase] = useState(false);
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

    formData.append('isPro', superErase.toString());

    try {
      const response = await axios.post('/api/common/erase-bg', formData, {
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
        toast.error('Failed to remove background');
      }
      queryClient.invalidateQueries({ queryKey: [queryKeys.credits] });
    } catch (error) {
      const errorMessage =
        error instanceof AxiosError
          ? error?.response?.data?.message
          : 'Failed to remove background';
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
    superErase,
    setSuperErase,
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
