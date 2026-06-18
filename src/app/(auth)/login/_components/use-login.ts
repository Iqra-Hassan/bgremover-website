import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'nextjs-toploader/app';
import { authClient } from '@/lib/auth-client';
import { useAuth } from '@/components/auth-provider';
import { User } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
  rememberMe: z.boolean().optional(),
});

export const useLogin = (onSuccess?: () => void) => {
  const { updateUser } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  const onSubmit = async (body: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    const { error, data } = await authClient.signIn.email(body);
    setIsLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }

    if (!data?.user) {
      toast.error('Login failed.');
      return;
    }

    toast.success('Login successfully.');
    updateUser(data?.user as User);
    if (onSuccess) {
      onSuccess();
    } else {
      router.push('/');
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

  const onPasskeySignIn = async () => {
    setPasskeyLoading(true);
    const data = await authClient.signIn.passkey();
    if (data?.error) {
      toast.error(data.error.message);
      setPasskeyLoading(false);
      return;
    }

    const { data: userData } = await authClient.getSession();

    if (!userData?.user) {
      toast.error('Login failed.');
      setPasskeyLoading(false);
      return;
    }

    setPasskeyLoading(false);
    toast.success('Login successfully.');
    updateUser(userData?.user as User);
    router.push('/');
  };
  return {
    form,
    onSubmit,
    isLoading,
    onGoogleSignIn,
    onFacebookSignIn,
    isGoogleLoading,
    isFacebookLoading,
    onPasskeySignIn,
    passkeyLoading,
  };
};
