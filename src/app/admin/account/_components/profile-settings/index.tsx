'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProfile } from './use-profile';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { allowedImageTypes } from '@/data/constans';
import { useAuth } from '@/components/auth-provider';

const ProfileSettings = () => {
  const { user } = useAuth();
  const { form, onSubmit, isPending } = useProfile(user);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your profile information and avatar.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-4">
                    <Avatar
                      className="size-12"
                      name={user?.name}
                      src={
                        field.value ? URL.createObjectURL(field.value) : user?.image || undefined
                      }
                    />
                    <Button variant="secondary" asChild size="sm">
                      <FormLabel>Change Avatar</FormLabel>
                    </Button>
                  </div>
                  <FormControl>
                    <Input
                      type="file"
                      accept={allowedImageTypes.join(',')}
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          field.onChange(e.target.files[0]);
                          e.target.value = '';
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button size="lg" isLoading={isPending} type="submit">
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default ProfileSettings;
