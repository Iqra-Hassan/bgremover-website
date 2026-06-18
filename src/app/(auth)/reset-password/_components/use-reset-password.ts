import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'nextjs-toploader/app';

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
    confirmPassword: z
      .string()
      .min(6, { message: 'Confirm Password must be at least 6 characters long' }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        path: ['confirmPassword'],
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match',
      });
    }
  });

export const useResetPassword = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (body: z.infer<typeof resetPasswordSchema>) => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
      toast.error('Invalid reset password link. Please try again.');
      return;
    }
    setIsLoading(true);
    const { error } = await authClient.resetPassword({
      newPassword: body.password,
      token,
    });
    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    toast.success('Password reset successfully.');
    setIsLoading(false);
    router.push('/');
  };

  return {
    form,
    onSubmit,
    isLoading,
  };
};
