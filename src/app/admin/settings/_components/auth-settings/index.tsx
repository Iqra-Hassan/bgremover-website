'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuthSettings } from './use-auth';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import SettingsLoader from '@/components/skeletons/settings-loader';
import CopyButton from '@/components/ui/copy-button';

const AuthSettings = () => {
  const { form, onSubmit, isPending, isLoading } = useAuthSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Authentication Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure authentication settings for your application.
        </p>
      </div>
      {isLoading ? (
        <SettingsLoader />
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="requireEmailVerification"
                render={({ field }) => (
                  <FormItem className="relative flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Require Email Verification</FormLabel>
                      <FormDescription>
                        Users must verify their email address before they can sign in.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="space-y-6 rounded-lg border p-4">
                <FormField
                  control={form.control}
                  name="allowGoogleSignIn"
                  render={({ field }) => (
                    <FormItem className="relative flex flex-row items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Allow Google Sign In</FormLabel>
                        <FormDescription>
                          Enable users to sign in with their Google account.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {form.watch('allowGoogleSignIn') && (
                  <>
                    <FormField
                      control={form.control}
                      isRequired
                      name="googleClientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Google Client ID</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      isRequired
                      name="googleClientSecret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Google Client Secret</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormItem>
                      <FormLabel>Callback URL</FormLabel>
                      <div className="relative">
                        <Input
                          value={`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`}
                          disabled
                          className="!opacity-100"
                        />
                        <CopyButton
                          textToCopy={`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`}
                          className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2"
                        />
                      </div>
                    </FormItem>
                  </>
                )}
              </div>
              <div className="space-y-6 rounded-lg border p-4">
                <FormField
                  control={form.control}
                  name="allowFacebookSignIn"
                  render={({ field }) => (
                    <FormItem className="relative flex flex-row items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Allow Facebook Sign In</FormLabel>
                        <FormDescription>
                          Enable users to sign in with their Facebook account.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {form.watch('allowFacebookSignIn') && (
                  <>
                    <FormField
                      control={form.control}
                      isRequired
                      name="facebookClientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facebook Client ID</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      isRequired
                      name="facebookClientSecret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facebook Client Secret</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormItem>
                      <FormLabel>Callback URL</FormLabel>
                      <div className="relative">
                        <Input
                          value={`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/facebook`}
                          disabled
                          className="!opacity-100"
                        />
                        <CopyButton
                          textToCopy={`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/facebook`}
                          className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2"
                        />
                      </div>
                    </FormItem>
                  </>
                )}
              </div>
            </div>
            <div className="mt-2">
              <Button size="lg" isLoading={isPending} type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default AuthSettings;
