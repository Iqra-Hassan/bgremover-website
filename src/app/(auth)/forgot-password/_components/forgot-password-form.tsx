'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForgotPassword } from './use-forgot-password';

const ForgotPasswordForm = () => {
  const { form, onSubmit, isLoading } = useForgotPassword();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Forgot Password</h1>
          <p className="text-gray">Enter your email to reset your password.</p>
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
        <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
          Send Reset Link
        </Button>
        <div>
          Remembered your password?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Login
          </Link>
        </div>
      </form>
    </Form>
  );
};

export default ForgotPasswordForm;
