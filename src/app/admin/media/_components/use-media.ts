import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useEffect, useRef, useState } from 'react';
import { SortOrder } from '@/lib/schema';
import { queryKeys } from '@/data/constans';
import { toast } from 'sonner';
import axios from 'axios';
import { generateRandomKey } from '@/lib/utils';
import type { InferResponseType } from 'hono/client';

interface MediaFilters {
  page: number;
  limit: number;
  sort?: string;
  order?: SortOrder;
  search: string;
  allowTypes?: string[];
}

export type Media = InferResponseType<(typeof apiClient.api.media)[':id']['$get']>;

export const useMedia = (defaultFilters?: Partial<MediaFilters>) => {
  const queryClient = useQueryClient();
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [preview, setPreview] = useState<Media | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [filters, setFilters] = useState<MediaFilters>({
    page: 1,
    limit: 15,
    sort: undefined,
    order: undefined,
    search: '',
    ...defaultFilters,
  });

  const setFilter = (filter: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, page: 1, ...filter }));
  };

  const { data, isFetching, error } = useQuery({
    queryKey: [queryKeys.admin.media, filters],
    queryFn: async () => {
      const response = await apiClient.api.media.$get({
        query: {
          page: filters.page.toString(),
          limit: filters.limit.toString(),
          ...(filters.sort && { sort: filters.sort }),
          ...(filters.order && { order: filters.order }),
          ...(filters.search && { search: filters.search }),
          ...(filters.allowTypes?.length && { allowTypes: filters.allowTypes.join(',') }),
        },
      });
      const result = await response.json();
      if (!response.ok) {
        const error = result as unknown as { message?: string };
        throw new Error(error?.message || 'Failed to fetch media');
      }

      return result;
    },
  });

  const { mutate: deleteMedia, isPending: isDeleting } = useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await apiClient.api.media.$delete({
        json: { ids },
      });
      const result = await response.json();
      if (!response.ok) {
        const error = result as unknown as { message?: string };
        throw new Error(error?.message || 'Failed to delete media');
      }

      return result;
    },
    onSuccess: () => {
      setSelected([]);
      setShowDeleteDialog(false);
      toast.success('Media deleted successfully');
      queryClient.invalidateQueries({ queryKey: [queryKeys.admin.media] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete media');
    },
  });

  useEffect(() => {
    setSelected([]);
  }, [filters]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Failed to fetch media');
    }
  }, [error]);

  return {
    filters,
    setFilter,
    data,
    isFetching,
    selected,
    setSelected,
    preview,
    setPreview,
    showDeleteDialog,
    setShowDeleteDialog,
    openUploadDialog,
    setOpenUploadDialog,
    openPreviewDialog,
    setOpenPreviewDialog,
    deleteMedia,
    isDeleting,
  };
};

const apiUrl = process.env.NEXT_PUBLIC_APP_URL;

type UploadFile = {
  id: string;
  file: File;
  error?: string;
  isUploaded?: boolean;
};

export const useUploadFiles = () => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setUploading] = useState(false);
  const queryClient = useQueryClient();
  const controller = useRef<AbortController>(null);

  const addFiles = (files: File[]) => {
    const newFiles = files.map((file) => ({
      id: generateRandomKey(16),
      file,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const uploadFile = async (item: UploadFile) => {
    const formData = new FormData();
    formData.append('file', item.file);
    setUploading(true);
    setProgress(0);
    controller.current = new AbortController();

    try {
      await axios.post(`${apiUrl}/api/media`, formData, {
        signal: controller.current?.signal,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent?.total || 1),
          );
          setProgress(percentCompleted);
        },
      });

      setProgress(0);
      setFiles((prev) =>
        prev.map((file) => (file.id === item.id ? { ...file, isUploaded: true } : file)),
      );
      queryClient.invalidateQueries({ queryKey: [queryKeys.admin.media] });
    } catch (err: any) {
      const error = err.response?.data?.message || 'Failed to upload file.';
      setFiles((prev) => prev.map((file) => (file.id === item.id ? { ...file, error } : file)));
    } finally {
      setUploading(false);
    }
  };

  const cancelUpload = (id: string) => {
    if (uploadingId === id) {
      controller.current?.abort();
      setUploading(false);
      setProgress(0);
      setUploadingId(null);
    }
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  useEffect(() => {
    if (files.length > 0 && !isUploading) {
      const file = files.find((file) => !file.isUploaded && !file.error);
      if (file) {
        setUploadingId(file.id);
        uploadFile(file);
      }
    }
  }, [files.length, isUploading]);

  return {
    files,
    addFiles,
    cancelUpload,
    progress,
    isUploading,
    uploadingId,
  };
};
