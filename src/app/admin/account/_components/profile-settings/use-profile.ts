import { User } from '@/lib/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/components/auth-provider';
import { authClient } from '@/lib/auth-client';

const profileSchema = z.object({
  image: z.instanceof(File).optional(),
  name: z.string().nonempty({ message: 'Name is required' }),
});

export const useProfile = (user: User | undefined) => {
  const { updateUser } = useAuth();
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      image: undefined,
      name: user?.name || '',
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (body: z.infer<typeof profileSchema>) => {
      const filteredBody = Object.fromEntries(
        Object.entries(body).filter(([_, value]) => value !== undefined),
      ) as z.infer<typeof profileSchema>;
      const response = await apiClient.api.users.me.$put({
        form: filteredBody,
      });
      const data = await response.json();
      if (!response.ok) {
        const error = data as unknown as { message?: string };
        throw new Error(error?.message || 'Failed to fetch storage settings');
      }

      return data;
    },
    onSuccess: async () => {
      toast.success('Profile updated successfully');
      const { data } = await authClient.getSession();
      if (data) {
        updateUser(data.user as User);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });

  const onSubmit = async (body: z.infer<typeof profileSchema>) => {
    updateProfileMutation.mutate(body);
  };

  return {
    form,
    onSubmit,
    isPending: updateProfileMutation.isPending,
  };
};
