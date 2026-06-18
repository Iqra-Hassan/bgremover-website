'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormInputSkeletons, FormTextareaSkeletons } from '@/components/skeletons/form-skeletons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePostForm } from './use-posts';
import { getPostStatusLabel } from '@/data/constans';
import { slugify } from '@/lib/utils';
import ImagePicker from '../../media/_components/image-picker';
import { MinimalTiptapEditor } from '@/components/ui/rich-editor';
import { PostStatus } from '@prisma/client';

interface PostFormProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'update';
  postId?: string | null;
}

export function PostForm({ onClose, mode, postId }: PostFormProps) {
  const { form, onSubmit, isSubmitting, isLoading } = usePostForm({ mode, postId, onClose });

  return (
    <>
      {isLoading ? (
        <div className="space-y-6 px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormInputSkeletons />
            <FormInputSkeletons />
          </div>
          <FormTextareaSkeletons />
          <FormInputSkeletons />
          <FormInputSkeletons />
          <FormTextareaSkeletons />
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={onSubmit} className="flex flex-1 flex-col overflow-y-auto">
            <div className="space-y-6 px-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  isRequired
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter post title"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            form.setValue('slug', slugify(e.target.value));
                            form.trigger('slug');
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  isRequired
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter post slug"
                          {...field}
                          onChange={(e) => field.onChange(slugify(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Excerpt</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter post excerpt" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="thumbnail"
                render={({ field }) => (
                  <FormItem className="w-full flex-1 sm:w-auto">
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <FormLabel>Thumbnail</FormLabel>
                        <p className="text-muted-foreground max-w-[300px] text-xs">
                          Thumbnail is use for your post. Recommended size is 1200x630px.
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
                name="status"
                isRequired
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          if (value) {
                            field.onChange(value);
                          }
                        }}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select post status" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(PostStatus).map((status) => (
                            <SelectItem key={status} value={status}>
                              {getPostStatusLabel(status)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                isRequired
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
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

            <SheetFooter>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="submit" size="lg" className="flex-1" isLoading={isSubmitting}>
                {mode === 'create' ? 'Create Post' : 'Update Post'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      )}
    </>
  );
}

export function PostFormSheet({ open, onClose, mode, postId }: PostFormProps) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="!w-[calc(100vw-2rem)] sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{mode === 'create' ? 'Create Post' : 'Update Post'}</SheetTitle>
        </SheetHeader>
        <PostForm open={open} onClose={onClose} mode={mode} postId={postId} />
      </SheetContent>
    </Sheet>
  );
}
