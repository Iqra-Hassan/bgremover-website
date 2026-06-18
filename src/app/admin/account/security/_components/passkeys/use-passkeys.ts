import { authClient } from '@/lib/auth-client';
import { queryKeys } from '@/data/constans';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export const usePasskeys = () => {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [createName, setCreateName] = useState<string>('');
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: [queryKeys.passkeys],
    queryFn: () => authClient.passkey.listUserPasskeys(),
  });

  const { mutate: deletePassKey, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await authClient.passkey.deletePasskey({
        id,
      });
      if (error) {
        throw new Error(error.message || 'Failed to revoke passkey');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.passkeys] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to revoke session');
    },
  });

  const createPassKeyMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await authClient.passkey.addPasskey({
        name,
      });
      if (response?.error) {
        throw new Error(response?.error.message || 'Failed to create passkey');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.passkeys] });
      toast.success('Passkey created successfully');
      setCreateName('');
      setShowCreateModal(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create passkey');
    },
  });

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Failed to fetch passkeys');
    }
  }, [error]);

  return {
    isLoading,
    passkeys: data?.data || [],
    deletePassKey,
    isDeleting,
    isCreating: createPassKeyMutation.isPending,
    createPassKey: () => createPassKeyMutation.mutate(createName),
    createName,
    setCreateName,
    showCreateModal,
    setShowCreateModal,
  };
};
