import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { billingProviders, paypalModes, queryKeys } from '@/data/constans';
import { useEffect } from 'react';

const billingSettingsSchema = z
  .object({
    provider: z.enum(billingProviders),
    currency: z.string().nonempty('Currency is required'),
    stripeSecretKey: z.string().optional(),
    stripeWebhookSecret: z.string().optional(),
    paypalMode: z.enum(paypalModes).optional(),
    paypalClientId: z.string().optional(),
    paypalClientSecret: z.string().optional(),
    paypalWebhookId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.provider === 'stripe') {
      if (!data.stripeSecretKey) {
        ctx.addIssue({
          path: ['stripeSecretKey'],
          code: z.ZodIssueCode.custom,
          message: 'Stripe secret key is required.',
        });
      }
      if (!data.stripeWebhookSecret) {
        ctx.addIssue({
          path: ['stripeWebhookSecret'],
          code: z.ZodIssueCode.custom,
          message: 'Stripe webhook secret is required.',
        });
      }
    }
    if (data.provider === 'paypal') {
      if (!data.paypalClientId) {
        ctx.addIssue({
          path: ['paypalClientId'],
          code: z.ZodIssueCode.custom,
          message: 'Paypal client ID is required.',
        });
      }
      if (!data.paypalClientSecret) {
        ctx.addIssue({
          path: ['paypalClientSecret'],
          code: z.ZodIssueCode.custom,
          message: 'Paypal client secret is required.',
        });
      }
      if (!data.paypalWebhookId) {
        ctx.addIssue({
          path: ['paypalWebhookId'],
          code: z.ZodIssueCode.custom,
          message: 'Paypal webhook ID is required.',
        });
      }
    }
  });

type BillingSettings = z.infer<typeof billingSettingsSchema>;

export const useBillingSettings = () => {
  const queryClient = useQueryClient();
  const form = useForm<BillingSettings>({
    resolver: zodResolver(billingSettingsSchema),
    defaultValues: {
      provider: 'stripe',
      currency: 'USD',
      stripeSecretKey: '',
      stripeWebhookSecret: '',
      paypalMode: 'live',
      paypalClientId: '',
      paypalClientSecret: '',
      paypalWebhookId: '',
    },
  });

  const {
    data: settings,
    isLoading,
    error,
  } = useQuery({
    queryKey: [queryKeys.settings.billing],
    queryFn: async () => {
      const response = await apiClient.api.settings.billing.$get();
      const data = await response.json();
      if (!response.ok) {
        const error = data as unknown as { message?: string };
        throw new Error(error?.message || 'Failed to fetch billing settings');
      }
      return data;
    },
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (body: BillingSettings) => {
      const response = await apiClient.api.settings.billing.$put({
        json: body,
      });
      const data = await response.json();
      if (!response.ok) {
        const error = data as unknown as { message?: string };
        throw new Error(error?.message || 'Failed to save billing settings');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.settings.billing] });
      toast.success('Billing settings saved successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = async (body: BillingSettings) => {
    saveSettingsMutation.mutate(body);
  };

  useEffect(() => {
    if (settings) {
      form.reset({
        provider: settings.provider || 'stripe',
        currency: settings.currency || 'USD',
        stripeSecretKey: settings.stripeSecretKey || '',
        stripeWebhookSecret: settings.stripeWebhookSecret || '',
        paypalMode: settings.paypalMode || 'live',
        paypalClientId: settings.paypalClientId || '',
        paypalClientSecret: settings.paypalClientSecret || '',
        paypalWebhookId: settings.paypalWebhookId || '',
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
