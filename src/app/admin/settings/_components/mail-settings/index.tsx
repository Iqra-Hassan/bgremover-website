'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useMailSettings } from './use-mail';
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
import { TagsInput } from '@/components/ui/tags-input';
import { PasswordInput } from '@/components/ui/password-input';

const MailSettings = () => {
  const { form, onSubmit, isPending, isLoading } = useMailSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Mail Settings</h1>
        <p className="text-muted-foreground mt-1">Configure email settings for your application.</p>
      </div>
      {isLoading ? (
        <SettingsLoader />
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="enableMail"
                render={({ field }) => (
                  <FormItem className="relative flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Mail Service</FormLabel>
                      <FormDescription>
                        Enable or disable the mail service for sending emails.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="senderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sender Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter sender name" {...field} />
                    </FormControl>
                    <FormDescription>
                      The name that will appear as the sender of emails.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="senderEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sender Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter sender email" type="email" {...field} />
                    </FormControl>
                    <FormDescription>
                      The email address that will appear as the sender of emails.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">SMTP Configuration</h3>

                <FormField
                  control={form.control}
                  name="smtpHost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SMTP Host</FormLabel>
                      <FormControl>
                        <Input placeholder="smtp.example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="smtpPort"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SMTP Port</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="587"
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Common ports: 587 (TLS), 465 (SSL), 25 (unencrypted)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="smtpUser"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SMTP Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter SMTP username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="smtpPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SMTP Password</FormLabel>
                      <FormControl>
                        <PasswordInput placeholder="Enter SMTP password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="smtpSecure"
                  render={({ field }) => (
                    <FormItem className="relative flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Use Secure Connection</FormLabel>
                        <FormDescription>
                          Enable SSL/TLS for secure email transmission.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Settings</h3>

                <FormField
                  control={form.control}
                  name="adminEmails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Notification Emails</FormLabel>
                      <FormControl>
                        <TagsInput
                          value={field.value || []}
                          onChange={field.onChange}
                          placeholder="Enter admin email addresses"
                        />
                      </FormControl>
                      <FormDescription>
                        Email addresses that will receive admin notifications. Press Enter or comma
                        to add.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="enableContactNotifications"
                  render={({ field }) => (
                    <FormItem className="relative flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Contact Form Notifications</FormLabel>
                        <FormDescription>
                          Send email notifications when contact form is submitted.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
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

export default MailSettings;
