import { queryKeys } from '@/data/constans';
import { apiClient } from '@/lib/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

export const useHistory = () => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const {
    data: history,
    error,
    isLoading: isLoadingHistory,
  } = useQuery({
    queryKey: [queryKeys.history, page],
    queryFn: async () => {
      const response = await apiClient.api.users.history.$get({
        query: {
          page: page.toString(),
        },
      });

      const result = await response.json();
      if (!response.ok) {
        const error = result as unknown as { message?: string };
        throw new Error(error?.message || 'Failed to get history');
      }

      return result;
    },
  });

  const { mutate: deleteHistory, isPending: isLoadingDeleteHistory } = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.api.users.history[':id'].$delete({
        param: { id },
      });

      const result = await response.json();
      if (!response.ok) {
        const error = result as unknown as { message?: string };
        throw new Error(error?.message || 'Failed to delete history');
      }

      return result;
    },
    onSuccess: () => {
      toast.success('History deleted successfully');
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: [queryKeys.history, page] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete history');
    },
  });

  const handleDeleteHistory = (id: string) => {
    deleteHistory(id);
  };

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Failed to get history');
    }
  }, [error]);

  return {
    history,
    isLoadingHistory,
    page,
    setPage,
    handleDeleteHistory,
    isLoadingDeleteHistory,
    deleteId,
    setDeleteId,
  };
};
