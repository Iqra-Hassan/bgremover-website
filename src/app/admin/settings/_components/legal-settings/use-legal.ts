import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { queryKeys } from '@/data/constans';
import { useEffect } from 'react';

const legalSettingsSchema = z.object({
  termsOfService: z.string().optional(),
  privacyPolicy: z.string().optional(),
});

type LegalSettings = z.infer<typeof legalSettingsSchema>;

export const useLegalSettings = () => {
  const queryClient = useQueryClient();
  const form = useForm<LegalSettings>({
    resolver: zodResolver(legalSettingsSchema),
    defaultValues: {
      termsOfService: '',
      privacyPolicy: '',
    },
  });

  const {
    data: settings,
    isLoading,
    error,
  } = useQuery({
    queryKey: [queryKeys.settings.legal],
    queryFn: async () => {
      const response = await apiClient.api.settings.legal.$get();
      const data = await response.json();
      if (!response.ok) {
        const error = data as unknown as { message?: string };
        throw new Error(error?.message || 'Failed to fetch legal settings');
      }
      return data;
    },
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (body: LegalSettings) => {
      const response = await apiClient.api.settings.legal.$put({
        json: body,
      });
      const data = await response.json();
      if (!response.ok) {
        const error = data as unknown as { message?: string };
        throw new Error(error?.message || 'Failed to save legal settings');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.settings.legal] });
      toast.success('Settings saved successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = async (body: LegalSettings) => {
    saveSettingsMutation.mutate(body);
  };

  useEffect(() => {
    if (settings) {
      form.reset({
        termsOfService: settings.termsOfService,
        privacyPolicy: settings.privacyPolicy,
      });
    }
  }, [settings, form]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Failed to fetch legal settings');
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
