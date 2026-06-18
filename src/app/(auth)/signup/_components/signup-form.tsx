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
import { useSignup } from './use-signup';
import { useSettings } from '@/components/settings-provider';
import { FaFacebook } from 'react-icons/fa';
import { Loader } from 'lucide-react';

const SignupForm = () => {
  const settings = useSettings();
  const {
    form,
    onSubmit,
    isLoading,
    onGoogleSignIn,
    onFacebookSignIn,
    isGoogleLoading,
    isFacebookLoading,
  } = useSignup();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Sign Up</h1>
          <p className="text-gray">Create an account to get started!</p>
        </div>
        <div className="space-y-6">
          {(settings?.auth.allowGoogleSignIn || settings?.auth.allowFacebookSignIn) && (
            <>
              <div className="flex flex-col gap-4 md:flex-row">
                {settings.auth.allowGoogleSignIn && (
                  <Button
                    variant="secondary"
                    className="flex-1"
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
              <div className="after:border-border relative text-center after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-background text-muted-foreground relative z-10 px-4 text-sm">
                  Or
                </span>
              </div>
            </>
          )}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <PasswordInput type="password" placeholder="Confirm your password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
            Sign Up
          </Button>
        </div>
        <div>
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Sign In
          </Link>
        </div>
      </form>
    </Form>
  );
};

export default SignupForm;
