'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FcGoogle } from 'react-icons/fc';
import { PasswordInput } from '@/components/ui/password-input';
import Link from 'next/link';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useLogin } from './use-login';
import { useSettings } from '@/components/settings-provider';
import { Loader, ShieldCheckIcon } from 'lucide-react';
import { FaFacebook } from 'react-icons/fa';

const LoginForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const settings = useSettings();
  const {
    form,
    onSubmit,
    isLoading,
    onGoogleSignIn,
    onFacebookSignIn,
    isGoogleLoading,
    isFacebookLoading,
    onPasskeySignIn,
    passkeyLoading,
  } = useLogin(onSuccess);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Sign In</h1>
          <p className="text-gray">Enter your email and password to sign in!</p>
        </div>
        <div className="space-y-6">
          <div className="space-y-4">
            {(settings?.auth.allowGoogleSignIn || settings?.auth.allowFacebookSignIn) && (
              <>
                <div className="flex flex-col gap-4 md:flex-row">
                  {settings.auth.allowGoogleSignIn && (
                    <Button
                      variant="secondary"
                      className="flex-1"
                      size="lg"
                      onClick={onGoogleSignIn}
                      disabled={isGoogleLoading}
                    >
                      {isGoogleLoading ? <Loader className="animate-spin" /> : <FcGoogle />}
                      Sign in with Google
                    </Button>
                  )}
                  {settings.auth.allowFacebookSignIn && (
                    <Button
                      variant="secondary"
                      className="flex-1"
                      size="lg"
                      onClick={onFacebookSignIn}
                      disabled={isFacebookLoading}
                    >
                      {isFacebookLoading ? (
                        <Loader className="animate-spin" />
                      ) : (
                        <FaFacebook className="text-blue-600" />
                      )}
                      Sign in with Facebook
                    </Button>
                  )}
                </div>
              </>
            )}
            <Button
              variant="secondary"
              className="w-full"
              onClick={onPasskeySignIn}
              disabled={passkeyLoading}
              size="lg"
            >
              {passkeyLoading ? <Loader className="animate-spin" /> : <ShieldCheckIcon />}
              Sign in with Passkey
            </Button>
          </div>
          <div className="after:border-border relative text-center after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <span className="bg-background text-muted-foreground relative z-10 px-4 text-sm">
              Or
            </span>
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="info@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput type="password" placeholder="Enter your password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="text-muted-foreground font-normal">Remember me</FormLabel>
                  </div>
                  <Link href="/forgot-password" className="text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button size="lg" type="submit" className="w-full" isLoading={isLoading}>
            Login
          </Button>
        </div>
        <div>
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </form>
    </Form>
  );
};

export default LoginForm;
