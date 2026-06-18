import { apiClient } from '@/lib/api-client';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

export const usePricing = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const { mutate: checkout, isPending: isLoadingCheckout } = useMutation({
    mutationFn: async (planId: string) => {
      const response = await apiClient.api.billing.checkout.$post({
        json: { planId },
      });

      const result = await response.json();
      if (!response.ok) {
        const error = result as unknown as { message?: string };
        throw new Error(error?.message || 'Failed to create checkout');
      }

      return result;
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create checkout');
    },
  });

  return {
    selectedPlan,
    setSelectedPlan,
    checkout,
    isLoadingCheckout,
  };
};
