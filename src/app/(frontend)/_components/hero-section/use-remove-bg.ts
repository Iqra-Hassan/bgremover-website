import { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/data/constans';
import { useAuth } from '@/components/auth-provider';
import { apiClient } from '@/lib/api-client';
import { localDB } from '@/lib/services/local-db';

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
        throw new Error('No outputUrl returned from backend');
      }
      queryClient.invalidateQueries({ queryKey: [queryKeys.credits] });
    } catch (error) {
      console.warn('Backend removal failed, falling back to client-side background removal...', error);
      toast.info('Using browser-based background removal (no server required)');
      
      try {
        const { removeBackground } = await import('@imgly/background-removal');
        const resultBlob = await removeBackground(file, {
          progress: (key: string, current: number, total: number) => {
            const percent = Math.round((current / total) * 100);
            setProgress(percent);
          }
        });
        
        // Save to local IndexedDB history
        const id = Math.random().toString(36).substring(7);
        await localDB.saveHistory(id, file, resultBlob);
        
        const outputUrl = URL.createObjectURL(resultBlob);
        setResultImage(outputUrl);
        setPreviewImage(outputUrl);
        toast.success('Background removed successfully in-browser!');
      } catch (clientError: any) {
        console.error('Client-side background removal failed:', clientError);
        toast.error(clientError?.message || 'Failed to remove background client-side');
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
