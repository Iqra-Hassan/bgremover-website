import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { queryKeys } from '@/data/constans';
import { useEffect } from 'react';

const mailSettingsSchema = z
  .object({
    enableMail: z.boolean(),
    senderName: z.string().optional(),
    senderEmail: z.union([z.literal(''), z.string().email()]).optional(),
    smtpHost: z.string().optional(),
    smtpPort: z.number().optional(),
    smtpUser: z.string().optional(),
    smtpPassword: z.string().optional(),
    smtpSecure: z.boolean().optional(),
    adminEmails: z.array(z.string().email()).optional(),
    enableContactNotifications: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.enableMail) {
      if (!data.senderName) {
        ctx.addIssue({
          path: ['senderName'],
          code: z.ZodIssueCode.custom,
          message: 'Sender name is required',
        });
      }
      if (!data.senderEmail) {
        ctx.addIssue({
          path: ['senderEmail'],
          code: z.ZodIssueCode.custom,
          message: 'Sender email is required',
        });
      }
      if (!data.smtpHost) {
        ctx.addIssue({
          path: ['smtpHost'],
          code: z.ZodIssueCode.custom,
          message: 'SMTP host is required',
        });
      }
      if (!data.smtpPort) {
        ctx.addIssue({
          path: ['smtpPort'],
          code: z.ZodIssueCode.custom,
          message: 'SMTP port is required',
        });
      }
      if (!data.smtpUser) {
        ctx.addIssue({
          path: ['smtpUser'],
          code: z.ZodIssueCode.custom,
          message: 'SMTP user is required',
        });
      }
      if (!data.smtpPassword) {
        ctx.addIssue({
          path: ['smtpPassword'],
          code: z.ZodIssueCode.custom,
          message: 'SMTP password is required',
        });
      }
    }
  });

type MailSettings = z.infer<typeof mailSettingsSchema>;

export const useMailSettings = () => {
  const queryClient = useQueryClient();
  const form = useForm<MailSettings>({
    resolver: zodResolver(mailSettingsSchema),
    defaultValues: {
      enableMail: false,
      senderName: '',
      senderEmail: '',
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      smtpSecure: false,
      adminEmails: [],
      enableContactNotifications: false,
    },
  });

  const {
    data: settings,
    isLoading,
    error,
  } = useQuery({
    queryKey: [queryKeys.settings.mail],
    queryFn: async () => {
      const response = await apiClient.api.settings.mail.$get();
      const data = await response.json();
      if (!response.ok) {
        const error = data as unknown as { message?: string };
        throw new Error(error?.message || 'Failed to fetch mail settings');
      }
      return data as MailSettings;
    },
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (body: MailSettings) => {
      const response = await apiClient.api.settings.mail.$put({
        json: body,
      });
      const data = await response.json();
      if (!response.ok) {
        const error = data as unknown as { message?: string };
        throw new Error(error?.message || 'Failed to save mail settings');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.settings.mail] });
      toast.success('Mail settings saved successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = async (body: MailSettings) => {
    saveSettingsMutation.mutate(body);
  };

  useEffect(() => {
    if (settings) {
      form.reset({
        enableMail: settings.enableMail || false,
        senderName: settings.senderName || '',
        senderEmail: settings.senderEmail || '',
        smtpHost: settings.smtpHost || '',
        smtpPort: settings.smtpPort || 587,
        smtpUser: settings.smtpUser || '',
        smtpPassword: settings.smtpPassword || '',
        smtpSecure: settings.smtpSecure || false,
        adminEmails: settings.adminEmails || [],
        enableContactNotifications: settings.enableContactNotifications || false,
      });
    }
  }, [settings, form]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Failed to fetch auth settings');
    }
  }, [error]);

  return {
    form,
    onSubmit,
    isPending: saveSettingsMutation.isPending,
    isLoading,
    settings,
  };
};
