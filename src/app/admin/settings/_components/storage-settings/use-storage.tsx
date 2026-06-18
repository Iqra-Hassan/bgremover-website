import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { queryKeys } from '@/data/constans';
import { useEffect } from 'react';
import { StorageType } from '@prisma/client';

const storageSettingsSchema = z
  .object({
    provider: z.nativeEnum(StorageType),
    s3Key: z.string().optional(),
    s3Secret: z.string().optional(),
    s3Region: z.string().optional(),
    s3Bucket: z.string().optional(),
    s3Folder: z.string().optional(),
    s3Endpoint: z.string().optional(),
    s3CustomDomain: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.provider === 's3') {
      if (!data.s3Key) {
        ctx.addIssue({
          path: ['s3Key'],
          code: z.ZodIssueCode.custom,
          message: 'S3 Key is required.',
        });
      }
      if (!data.s3Secret) {
        ctx.addIssue({
          path: ['s3Secret'],
          code: z.ZodIssueCode.custom,
          message: 'S3 Secret is required.',
        });
      }
      if (!data.s3Region) {
        ctx.addIssue({
          path: ['s3Region'],
          code: z.ZodIssueCode.custom,
          message: 'S3 Region is required.',
        });
      }
      if (!data.s3Bucket) {
        ctx.addIssue({
          path: ['s3Bucket'],
          code: z.ZodIssueCode.custom,
          message: 'S3 Bucket is required.',
        });
      }
      if (!data.s3Endpoint) {
        ctx.addIssue({
          path: ['s3Endpoint'],
          code: z.ZodIssueCode.custom,
          message: 'S3 Endpoint is required.',
        });
      }
    }
  });

export const useStorageSettings = () => {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof storageSettingsSchema>>({
    resolver: zodResolver(storageSettingsSchema),
    defaultValues: {
      provider: 'local',
      s3Key: '',
      s3Secret: '',
      s3Region: '',
      s3Bucket: '',
      s3Folder: '',
      s3Endpoint: '',
      s3CustomDomain: '',
    },
  });

  const {
    data: settings,
    isLoading,
    error,
  } = useQuery({
    queryKey: [queryKeys.settings.storage],
    queryFn: async () => {
      const response = await apiClient.api.settings.storage.$get();
      const data = await response.json();
      if (!response.ok) {
        const error = data as unknown as { message?: string };
        throw new Error(error?.message || 'Failed to fetch storage settings');
      }
      return data;
    },
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (body: z.infer<typeof storageSettingsSchema>) => {
      const response = await apiClient.api.settings.storage.$put({
        json: body,
      });
      const data = await response.json();
      if (!response.ok) {
        const error = data as unknown as { message?: string };
        throw new Error(error?.message || 'Failed to save storage settings');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.settings.storage] });
      toast.success('Settings saved successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = async (body: z.infer<typeof storageSettingsSchema>) => {
    saveSettingsMutation.mutate(body);
  };

  useEffect(() => {
    if (settings) {
      form.reset({
        provider: settings.provider,
        s3Key: settings.s3Key || '',
        s3Secret: settings.s3Secret || '',
        s3Region: settings.s3Region || '',
        s3Bucket: settings.s3Bucket || '',
        s3Folder: settings.s3Folder || '',
        s3Endpoint: settings.s3Endpoint || '',
        s3CustomDomain: settings.s3CustomDomain || '',
      });
    }
  }, [settings]);

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
