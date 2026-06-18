import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authClient } from '@/lib/auth-client';
import { useState } from 'react';
import { toast } from 'sonner';
import { useSettings } from '@/components/settings-provider';

const singupSchema = z
  .object({
    name: z.string().min(1, { message: 'Name is required' }),
    email: z.string().email({ message: 'Invalid email address' }),
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

export const useSignup = () => {
  const settings = useSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const form = useForm<z.infer<typeof singupSchema>>({
    resolver: zodResolver(singupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (body: z.infer<typeof singupSchema>) => {
    setIsLoading(true);
    const { error } = await authClient.signUp.email(body);
    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    form.reset();
    setIsLoading(false);

    if (settings?.auth.requireEmailVerification) {
      toast.success('Sign up successful! Please check your email to verify your account.');
    } else {
      window.location.href = '/';
    }
  };

  const onGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const { error } = await authClient.signIn.social({
      provider: 'google',
    });
    setIsGoogleLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
  };

  const onFacebookSignIn = async () => {
    setIsFacebookLoading(true);
    const { error } = await authClient.signIn.social({
      provider: 'facebook',
    });
    setIsFacebookLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
  };

  return {
    form,
    onSubmit,
    isLoading,
    onGoogleSignIn,
    onFacebookSignIn,
    isGoogleLoading,
    isFacebookLoading,
  };
};
