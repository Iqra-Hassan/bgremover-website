'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useStorageSettings } from './use-storage';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import SettingsLoader from '@/components/skeletons/settings-loader';
import { StorageType } from '@prisma/client';

const StorageSettings = () => {
  const { form, onSubmit, isPending, isLoading } = useStorageSettings();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Storage Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure the storage provider for your application.
        </p>
      </div>
      {isLoading ? (
        <SettingsLoader />
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <div className="space-y-6">
              <FormField
                isRequired
                control={form.control}
                name="provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Storage Provider</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(e) => {
                          if (e) {
                            field.onChange(e);
                          }
                        }}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full capitalize">
                          <SelectValue placeholder="Select a storage provider" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(StorageType).map((provider) => (
                            <SelectItem className="capitalize" key={provider} value={provider}>
                              {provider}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      We recommend using s3 for production. You can use any s3 compatible provider
                      like aws s3, cloudflare r2, digitalocean spaces, etc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.watch('provider') === 's3' && (
                <>
                  <FormField
                    control={form.control}
                    name="s3Key"
                    isRequired
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>S3 Key</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your S3 key" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="s3Secret"
                    isRequired
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>S3 Secret</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your S3 secret" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="s3Region"
                    isRequired
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>S3 Region</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your S3 region" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="s3Bucket"
                    isRequired
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>S3 Bucket</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your S3 bucket" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="s3Endpoint"
                    isRequired
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>S3 Endpoint</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your S3 endpoint" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="s3Folder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>S3 Folder</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your S3 folder" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="s3CustomDomain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>S3 Custom Domain</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your S3 custom domain" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
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

export default StorageSettings;
