import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, { message: 'Current Password must be at least 6 characters long' }),
    newPassword: z.string().min(6, { message: 'New Password must be at least 6 characters long' }),
    confirmPassword: z
      .string()
      .min(6, { message: 'Confirm Password must be at least 6 characters long' }),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        path: ['confirmPassword'],
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match',
      });
    }
  });

export const useChangePassword = () => {
  const form = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (body: z.infer<typeof changePasswordSchema>) => {
      const { error } = await authClient.changePassword({
        currentPassword: body.currentPassword,
        newPassword: body.newPassword,
      });
      if (error) {
        throw new Error(error.message || 'Failed to change password');
      }
    },
    onSuccess: () => {
      form.reset();
      toast.success('Password changed successfully');
    },
    onError: (error) => {
      // Handle error, e.g., show a toast notification
      toast.error(error.message || 'Failed to change password');
    },
  });

  const onSubmit = async (body: z.infer<typeof changePasswordSchema>) => {
    changePasswordMutation.mutate(body);
  };

  return {
    form,
    onSubmit,
    isPending: changePasswordMutation.isPending,
  };
};
