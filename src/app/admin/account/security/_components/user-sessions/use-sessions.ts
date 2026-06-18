import { authClient } from '@/lib/auth-client';
import { queryKeys } from '@/data/constans';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useEffect } from 'react';

export const useSessions = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: [queryKeys.sessions],
    queryFn: () => authClient.listSessions(),
  });

  const { mutate: revokeSession, isPending: isLoggingOut } = useMutation({
    mutationFn: async (token: string) => {
      const { error } = await authClient.revokeSession({
        token,
      });
      if (error) {
        throw new Error(error.message || 'Failed to revoke session');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.sessions] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to revoke session');
    },
  });

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Failed to fetch sessions');
    }
  }, [error]);

  return {
    isLoading,
    sessions: data?.data || [],
    revokeSession,
    isLoggingOut,
  };
};
