import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { queryKeys } from '@/data/constans';
import { useEffect } from 'react';

const authSettingsSchema = z
  .object({
    requireEmailVerification: z.boolean(),
    allowGoogleSignIn: z.boolean(),
    googleClientId: z.string().optional(),
    googleClientSecret: z.string().optional(),
    allowFacebookSignIn: z.boolean(),
    facebookClientId: z.string().optional(),
    facebookClientSecret: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.allowGoogleSignIn) {
      if (!data.googleClientId) {
        ctx.addIssue({
          path: ['googleClientId'],
          code: z.ZodIssueCode.custom,
          message: 'Google client ID is required.',
        });
      }
      if (!data.googleClientSecret) {
        ctx.addIssue({
          path: ['googleClientSecret'],
          code: z.ZodIssueCode.custom,
          message: 'Google client secret is required.',
        });
      }
    }
    if (data.allowFacebookSignIn) {
      if (!data.facebookClientId) {
        ctx.addIssue({
          path: ['facebookClientId'],
          code: z.ZodIssueCode.custom,
          message: 'Facebook client ID is required.',
        });
      }
      if (!data.facebookClientSecret) {
        ctx.addIssue({
          path: ['facebookClientSecret'],
          code: z.ZodIssueCode.custom,
          message: 'Facebook client secret is required.',
        });
      }
    }
  });

type AuthSettings = z.infer<typeof authSettingsSchema>;

export const useAuthSettings = () => {
  const queryClient = useQueryClient();
  const form = useForm<AuthSettings>({
    resolver: zodResolver(authSettingsSchema),
    defaultValues: {
      requireEmailVerification: false,
      allowGoogleSignIn: false,
      googleClientId: '',
      googleClientSecret: '',
      allowFacebookSignIn: false,
      facebookClientId: '',
      facebookClientSecret: '',
    },
  });

  const {
    data: settings,
    isLoading,
    error,
  } = useQuery({
    queryKey: [queryKeys.settings.auth],
    queryFn: async () => {
      const response = await apiClient.api.settings.auth.$get();
      const data = await response.json();
      if (!response.ok) {
        const error = data as unknown as { message?: string };
        throw new Error(error?.message || 'Failed to fetch auth settings');
      }
      return data as AuthSettings;
    },
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (body: AuthSettings) => {
      const response = await apiClient.api.settings.auth.$put({
        json: body,
      });
      const data = await response.json();
      if (!response.ok) {
        const error = data as unknown as { message?: string };
        throw new Error(error?.message || 'Failed to save auth settings');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.settings.auth] });
      toast.success('Settings saved successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = async (body: AuthSettings) => {
    saveSettingsMutation.mutate(body);
  };

  useEffect(() => {
    if (settings) {
      form.reset(settings);
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
  };
};
