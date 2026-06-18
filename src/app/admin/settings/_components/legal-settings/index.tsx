'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useLegalSettings } from './use-legal';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { MinimalTiptapEditor } from '@/components/ui/rich-editor';
import SettingsLoader from '@/components/skeletons/settings-loader';

const GeneralSettings = () => {
  const { form, onSubmit, isPending, isLoading } = useLegalSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Legal Settings</h1>
        <p className="text-muted-foreground mt-1">Configure legal settings for your application.</p>
      </div>
      {isLoading ? (
        <SettingsLoader />
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="termsOfService"
                isRequired
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Terms of Service</FormLabel>
                    <FormControl>
                      <MinimalTiptapEditor
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="privacyPolicy"
                isRequired
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Privacy Policy</FormLabel>
                    <FormControl>
                      <MinimalTiptapEditor
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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

export default GeneralSettings;
