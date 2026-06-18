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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useUserForm } from './use-users';
import { getUserRoleLabel, userRoles } from '@/data/constans';
import { PasswordInput } from '@/components/ui/password-input';
import { FormInputSkeletons } from '@/components/skeletons/form-skeletons';
import { NumberInput } from '@/components/ui/number-input';

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'update';
  userId?: string | null;
}

export function UserForm({ onClose, mode, userId }: UserFormProps) {
  const { form, onSubmit, isSubmitting, isLoading } = useUserForm({ mode, userId, onClose });

  return (
    <>
      {isLoading ? (
        <div className="space-y-6 px-6">
          <FormInputSkeletons />
          <FormInputSkeletons />
          <FormInputSkeletons />
          <FormInputSkeletons />
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={onSubmit} className="flex flex-1 flex-col overflow-y-auto">
            <div className="space-y-6 px-6">
              <FormField
                control={form.control}
                name="name"
                isRequired
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter user name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                isRequired
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter user email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {mode === 'create' && (
                <FormField
                  control={form.control}
                  name="password"
                  isRequired
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <PasswordInput placeholder="Enter user password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="role"
                isRequired
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(e) => {
                          if (e) {
                            field.onChange(e);
                          }
                        }}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {userRoles.map((role) => (
                            <SelectItem key={role} value={role}>
                              {getUserRoleLabel(role)}
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
                name="credits"
                isRequired
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credits</FormLabel>
                    <FormControl>
                      <NumberInput
                        placeholder="Enter user credits"
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {mode === 'update' && (
                <FormField
                  control={form.control}
                  name="emailVerified"
                  isRequired
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel>Email Verified</FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
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
                {mode === 'create' ? 'Create User' : 'Update User'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      )}
    </>
  );
}

export function UserFormSheet({ open, onClose, mode, userId }: UserFormProps) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{mode === 'create' ? 'Create User' : 'Update User'}</SheetTitle>
        </SheetHeader>
        <UserForm open={open} onClose={onClose} mode={mode} userId={userId} />
      </SheetContent>
    </Sheet>
  );
}
