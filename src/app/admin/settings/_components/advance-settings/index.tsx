'use client';

import React from 'react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAdvanceSettings } from './use-advance';
import SettingsLoader from '@/components/skeletons/settings-loader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CopyButton from '@/components/ui/copy-button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function AdvanceSettings() {
  const {
    form,
    onSubmit,
    isPending,
    isLoading,
    expiredEdits,
    removeExpiredEdits,
    isLoadingRemoveExpiredEdits,
  } = useAdvanceSettings();

  const bgRemoverProvider = form.watch('bgRemoverProvider');

  return (
    <div className="mx-auto w-full max-w-full space-y-6 lg:max-w-xl">
      <div>
        <h1 className="text-xl font-semibold">Advance settings</h1>
        <p className="text-muted-foreground mt-1">Configure your advance settings here.</p>
      </div>
      <div className="space-y-6">
        {isLoading ? (
          <SettingsLoader />
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="bgRemoverProvider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Background Removal Provider</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a background removal provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="replicate">Replicate (Cloud)</SelectItem>
                          <SelectItem value="local">Rembg (Local/Self-Hosted - Free)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="aiApiKey"
                  isRequired={bgRemoverProvider === 'replicate'}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Replicate API Key</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
        <div className="rounded-lg border p-4">
          <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold">
            Cleanup expired edits{' '}
            <span className="text-muted-foreground text-xs">
              (Remaining: {expiredEdits?.count || 0})
            </span>
          </h2>
          <p className="text-muted-foreground mb-6">
            This will delete all expired edits. This is useful for cleaning up files that are no
            longer needed.
          </p>
          <Button
            isLoading={isLoadingRemoveExpiredEdits}
            variant="destructive"
            className="h-10 min-w-[100px]"
            type="button"
            onClick={() => {
              removeExpiredEdits();
            }}
          >
            Clean Expired Edits
          </Button>
          <FormItem className="mt-6 w-full flex-1 sm:w-auto">
            <Label>API URL</Label>
            <p className="bg-muted flex h-10 items-center justify-between rounded-md p-3 pr-0 text-xs">
              {`${process.env.NEXT_PUBLIC_APP_URL}/api/common/remove-expired-edits`}
              <CopyButton
                textToCopy={`${process.env.NEXT_PUBLIC_APP_URL}/api/common/remove-expired-edits`}
              />
            </p>
          </FormItem>
          <p className="mt-4 text-xs">
            You can use this API URL to trigger the cleanup process manually. Or you can set up a
            scheduled job to run this URL every 1 hours. For example, you can use{' '}
            <strong>https://upstash.com/</strong> to schedule a job to run this URL every 1 hours.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdvanceSettings;
