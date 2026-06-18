import { queryKeys } from '@/data/constans';
import { apiClient } from '@/lib/api-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const advancedSettingsSchema = z
  .object({
    aiApiKey: z.string().optional(),
    bgRemoverProvider: z.enum(['replicate', 'local']),
  })
  .superRefine((data, ctx) => {
    if (data.bgRemoverProvider === 'replicate' && !data.aiApiKey) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['aiApiKey'],
        message: 'API key is required when Replicate is selected.',
      });
    }
  });

type AdvancedSettings = z.infer<typeof advancedSettingsSchema>;

export const useAdvanceSettings = () => {
  const queryClient = useQueryClient();
  const form = useForm<AdvancedSettings>({
    resolver: zodResolver(advancedSettingsSchema),
    defaultValues: {
      aiApiKey: '',
      bgRemoverProvider: 'replicate',
    },
  });

  const { data: expiredEdits } = useQuery({
    queryKey: [queryKeys.expiredEdits],
    queryFn: async () => {
      const response = await apiClient.api.common['expired-edits'].$get();

      const result = await response.json();
      if (!response.ok) {
        const error = result as unknown as { message?: string };
        throw new Error(error?.message || 'Failed to get expired edits count.');
      }

      return result;
    },
  });

  const { mutate: removeExpiredEdits, isPending: isLoadingRemoveExpiredEdits } = useMutation({
    mutationFn: async () => {
      const response = await apiClient.api.common['remove-expired-edits'].$get();

      const result = await response.json();
      if (!response.ok) {
        const error = result as unknown as { message?: string };
        throw new Error(error?.message || 'Failed to remove expired edits');
      }

      return result;
    },
    onSuccess: () => {
      toast.success('Expired edits removed');
      queryClient.invalidateQueries({ queryKey: [queryKeys.expiredEdits] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove expired edits');
    },
  });

  const {
    data: settings,
    isLoading,
    error,
  } = useQuery({
    queryKey: [queryKeys.settings.advanced],
    queryFn: async () => {
      const response = await apiClient.api.settings.advanced.$get();
      const data = await response.json();
      if (!response.ok) {
        const error = data as unknown as { message?: string };
        throw new Error(error?.message || 'Failed to fetch advance settings');
      }
      return data;
    },
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (body: AdvancedSettings) => {
      const response = await apiClient.api.settings.advanced.$put({
        json: body,
      });
      const data = await response.json();
      if (!response.ok) {
        const error = data as unknown as { message?: string };
        throw new Error(error?.message || 'Failed to save advanced settings');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.settings.advanced] });
      toast.success('Settings saved successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = async (body: AdvancedSettings) => {
    saveSettingsMutation.mutate(body);
  };

  useEffect(() => {
    if (settings) {
      form.reset({
        aiApiKey: settings.aiApiKey || '',
        bgRemoverProvider: settings.bgRemoverProvider || 'replicate',
      });
    }
  }, [settings, form]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Failed to fetch advanced settings');
    }
  }, [error]);

  return {
    form,
    onSubmit,
    isPending: saveSettingsMutation.isPending,
    isLoading,
    settings,
    expiredEdits,
    removeExpiredEdits,
    isLoadingRemoveExpiredEdits,
  };
};
