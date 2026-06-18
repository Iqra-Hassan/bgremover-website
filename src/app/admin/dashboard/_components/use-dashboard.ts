import { queryKeys } from '@/data/constans';
import { apiClient } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';

export function useAdminStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: [queryKeys.admin.stats],
    queryFn: async () => {
      const response = await apiClient.api.common.admin.stats.$get();

      const result = await response.json();
      if (!response.ok) {
        const error = result as unknown as { message?: string };
        throw new Error(error?.message || 'Failed to fetch media');
      }

      return result;
    },
  });

  return {
    stats,
    isLoading,
  };
}
