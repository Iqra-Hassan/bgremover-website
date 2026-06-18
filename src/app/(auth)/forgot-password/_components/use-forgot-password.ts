import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

export const useForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (body: z.infer<typeof forgotPasswordSchema>) => {
    setIsLoading(true);
    const { error } = await authClient.forgetPassword({
      email: body.email,
      redirectTo: '/reset-password',
    });
    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    toast.success('Reset password link sent to your email.');
    setIsLoading(false);
    form.reset();
  };

  return {
    form,
    onSubmit,
    isLoading,
  };
};
