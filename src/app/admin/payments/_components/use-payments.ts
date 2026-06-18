import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useEffect, useState } from 'react';
import { SortOrder } from '@/lib/schema';
import { queryKeys } from '@/data/constans';
import { toast } from 'sonner';

interface PaymentFilters {
  page: number;
  limit: number;
  sort?: string;
  order?: SortOrder;
  status: string[];
}

export const usePayments = (limit?: number) => {
  const [filters, setFilters] = useState<PaymentFilters>({
    page: 1,
    limit: limit || 15,
    sort: undefined,
    order: undefined,
    status: [],
  });
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  const setFilter = (filter: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, page: 1, ...filter }));
  };

  const { data, isFetching, error } = useQuery({
    queryKey: [queryKeys.admin.payments, filters],
    queryFn: async () => {
      const response = await apiClient.api.billing.payments.$get({
        query: {
          page: filters.page.toString(),
          limit: filters.limit.toString(),
          ...(filters.sort && { sort: filters.sort }),
          ...(filters.order && { order: filters.order }),
          ...(filters.status.length && { status: filters.status.join(',') }),
        },
      });
      const result = await response.json();
      if (!response.ok) {
        const error = result as unknown as { message?: string };
        throw new Error(error?.message || 'Failed to fetch Payments');
      }

      return result;
    },
  });

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Failed to fetch Payments');
    }
  }, [error]);

  return {
    filters,
    setFilter,
    data,
    isFetching,
    selectedPayment,
    setSelectedPayment,
  };
};
