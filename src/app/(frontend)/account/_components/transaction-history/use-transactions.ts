import { queryKeys } from '@/data/constans';
import { apiClient } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

export const useTransactions = () => {
  const [page, setPage] = useState(1);
  const {
    data: transactions,
    error,
    isLoading: isLoadingTransactions,
  } = useQuery({
    queryKey: [queryKeys.transactions, page],
    queryFn: async () => {
      const response = await apiClient.api.users.payments.$get({
        query: {
          page: page.toString(),
        },
      });

      const result = await response.json();
      if (!response.ok) {
        const error = result as unknown as { message?: string };
        throw new Error(error?.message || 'Failed to get transaction history');
      }

      return result;
    },
  });

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Failed to get transaction history');
    }
  }, [error]);

  return {
    transactions,
    isLoadingTransactions,
    page,
    setPage,
  };
};
