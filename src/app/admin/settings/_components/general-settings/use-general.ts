import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { queryKeys } from '@/data/constans';
import { useEffect } from 'react';

const generalSettingsSchema = z.object({
  applicationName: z.string().nonempty('Application name is required'),
  siteTitle: z.string().nonempty('Site title is required'),
  siteDescription: z.string().nonempty('Site description is required'),
  siteKeywords: z.array(z.string().min(1)).optional(),
  logo: z.string().optional(),
  logoDark: z.string().optional(),
  coverImage: z.string().optional(),
  favicon: z.string().optional(),
});

type GeneralSettings = z.infer<typeof generalSettingsSchema>;

export const useGeneralSettings = () => {
  const queryClient = useQueryClient();
  const form = useForm<GeneralSettings>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      applicationName: '',
      siteTitle: '',
      siteDescription: '',
      siteKeywords: [],
      logo: '',
      logoDark: '',
      coverImage: '',
      favicon: '',
    },
  });

  const {
    data: settings,
    isLoading,
    error,
  } = useQuery({
    queryKey: [queryKeys.settings.general],
    queryFn: async () => {
      const response = await apiClient.api.settings.general.$get();
      const data = await response.json();
      if (!response.ok) {
        const error = data as unknown as { message?: string };
        throw new Error(error?.message || 'Failed to fetch general settings');
      }
      return data;
    },
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (body: GeneralSettings) => {
      const response = await apiClient.api.settings.general.$put({
        json: body,
      });
      const data = await response.json();
      if (!response.ok) {
        const error = data as unknown as { message?: string };
        throw new Error(error?.message || 'Failed to save general settings');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.settings.general] });
      toast.success('Settings saved successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = async (body: GeneralSettings) => {
    saveSettingsMutation.mutate(body);
  };

  useEffect(() => {
    if (settings) {
      form.reset({
        applicationName: settings.applicationName,
        siteTitle: settings.siteTitle,
        siteDescription: settings.siteDescription,
        siteKeywords: settings.siteKeywords,
        logo: settings.logo,
        logoDark: settings.logoDark,
        coverImage: settings.coverImage,
        favicon: settings.favicon,
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
