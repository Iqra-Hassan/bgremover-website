'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useGeneralSettings } from './use-general';
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
import { Textarea } from '@/components/ui/textarea';
import SettingsLoader from '@/components/skeletons/settings-loader';
import { TagsInput } from '@/components/ui/tags-input';
import ImagePicker from '@/app/admin/media/_components/image-picker';

const GeneralSettings = () => {
  const { form, onSubmit, isPending, isLoading } = useGeneralSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">General Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure general settings for your application.
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
                name="applicationName"
                isRequired
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter application name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="siteTitle"
                isRequired
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter site title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="siteDescription"
                isRequired
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter site description"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="siteKeywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site Keywords</FormLabel>
                    <FormControl>
                      <TagsInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Enter site keywords"
                      />
                    </FormControl>
                    <FormDescription>Press Enter or comma to add a keyword.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem className="w-full flex-1 sm:w-auto">
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <FormLabel>Logo</FormLabel>
                        <p className="text-muted-foreground max-w-[300px] text-xs">
                          Logo is use for your application branding. Recommended size is 300x120px.
                        </p>
                      </div>
                      <FormControl>
                        <ImagePicker value={field.value} onChange={field.onChange} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="logoDark"
                render={({ field }) => (
                  <FormItem className="w-full flex-1 sm:w-auto">
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <FormLabel>
                          Logo <span className="text-muted-foreground text-xs">(dark mode)</span>
                        </FormLabel>
                        <p className="text-muted-foreground max-w-[300px] text-xs">
                          Logo is use for your application branding. Recommended size is 300x120px.
                        </p>
                      </div>
                      <FormControl>
                        <ImagePicker value={field.value} onChange={field.onChange} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="favicon"
                render={({ field }) => (
                  <FormItem className="w-full flex-1 sm:w-auto">
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <FormLabel>Favicon</FormLabel>
                        <p className="text-muted-foreground max-w-[300px] text-xs">
                          Favicon is use for your application branding. Recommended size is 32x32px.
                        </p>
                      </div>
                      <FormControl>
                        <ImagePicker value={field.value} onChange={field.onChange} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="coverImage"
                render={({ field }) => (
                  <FormItem className="w-full flex-1 sm:w-auto">
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <FormLabel>Cover Image</FormLabel>
                        <p className="text-muted-foreground max-w-[300px] text-xs">
                          Cover image is use for your application branding. Recommended size is
                          1920x1080px.
                        </p>
                      </div>
                      <FormControl>
                        <ImagePicker value={field.value} onChange={field.onChange} />
                      </FormControl>
                    </div>
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
