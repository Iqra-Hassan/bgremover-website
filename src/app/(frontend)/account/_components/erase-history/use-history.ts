import { queryKeys } from '@/data/constans';
import { apiClient } from '@/lib/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { localDB } from '@/lib/services/local-db';

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
      let serverDocs: any[] = [];
      let serverError = false;

      try {
        const response = await apiClient.api.users.history.$get({
          query: {
            page: page.toString(),
          },
        });
        const result = await response.json();
        if (response.ok) {
          serverDocs = result.docs || [];
        } else {
          serverError = true;
        }
      } catch (err) {
        console.warn('Backend history fetch failed, falling back to local history:', err);
        serverError = true;
      }

      const localList = await localDB.getHistoryList();
      
      let mergedDocs = [...localList];
      if (!serverError && serverDocs.length > 0) {
        const existingIds = new Set(localList.map(item => item.id));
        const uniqueServerDocs = serverDocs.filter(item => !existingIds.has(item.id));
        mergedDocs = [...uniqueServerDocs, ...localList];
      }

      mergedDocs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const limit = 10;
      const total = mergedDocs.length;
      const totalPages = Math.ceil(total / limit);
      const start = (page - 1) * limit;
      const docs = mergedDocs.slice(start, start + limit);

      return {
        docs,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    },
  });

  const { mutate: deleteHistory, isPending: isLoadingDeleteHistory } = useMutation({
    mutationFn: async (id: string) => {
      try {
        const response = await apiClient.api.users.history[':id'].$delete({
          param: { id },
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error('Failed to delete history on backend');
        }
        return result;
      } catch (error) {
        console.warn('Backend delete history failed, deleting from local DB...', error);
        await localDB.deleteHistory(id);
        return { success: true };
      }
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
