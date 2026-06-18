import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useEffect, useState } from 'react';
import { SortOrder } from '@/lib/schema';
import { queryKeys } from '@/data/constans';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlanStatus } from '@prisma/client';

interface PlanFilters {
  page: number;
  limit: number;
  sort?: string;
  order?: SortOrder;
  search: string;
}

export const usePlans = () => {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [filters, setFilters] = useState<PlanFilters>({
    page: 1,
    limit: 15,
    sort: undefined,
    order: undefined,
    search: '',
  });

  const setFilter = (filter: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, page: 1, ...filter }));
  };

  const { data, isFetching, error } = useQuery({
    queryKey: [queryKeys.admin.plans, filters],
    queryFn: async () => {
      const response = await apiClient.api.plans.$get({
        query: {
          page: filters.page.toString(),
          limit: filters.limit.toString(),
          ...(filters.sort && { sort: filters.sort }),
          ...(filters.order && { order: filters.order }),
          ...(filters.search && { search: filters.search }),
        },
      });
      const result = await response.json();
      if (!response.ok) {
        const error = result as unknown as { message?: string };
        throw new Error(error?.message || 'Failed to fetch plans');
      }

      return result;
    },
  });

  const { mutate: deletePlans, isPending: isDeleting } = useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await apiClient.api.plans.$delete({
        json: { ids },
      });
      const result = await response.json();
      if (!response.ok) {
        const error = result as unknown as { message?: string };
        throw new Error(error?.message || 'Failed to delete plans');
      }

      return result;
    },
    onSuccess: () => {
      setSelected([]);
      setShowDeleteDialog(false);
      toast.success('Plans deleted successfully');
      queryClient.invalidateQueries({ queryKey: [queryKeys.admin.plans] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete plans');
    },
  });

  useEffect(() => {
    setSelected([]);
  }, [filters]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Failed to fetch plans');
    }
  }, [error]);

  return {
    filters,
    setFilter,
    data,
    isFetching,
    selected,
    setSelected,
    showDeleteDialog,
    setShowDeleteDialog,
    openCreateDialog,
    setOpenCreateDialog,
    openUpdateDialog,
    setOpenUpdateDialog,
    selectedPlan,
    setSelectedPlan,
    deletePlans,
    isDeleting,
  };
};

interface UsePlanFormProps {
  mode: 'create' | 'update';
  planId?: string | null;
  onClose: () => void;
}

const planFormSchema = z.object({
  name: z.string().nonempty('Name is required'),
  description: z.string().nonempty('Description is required'),
  price: z.number().min(0, 'Price is required and must be greater than 0'),
  features: z.array(z.string().nonempty()),
  status: z.nativeEnum(PlanStatus),
  order: z.number().min(0, 'Order is required'),
  credits: z.number().min(0, 'Credist is required'),
  isPopular: z.boolean(),
});

export const usePlanForm = ({ mode, planId, onClose }: UsePlanFormProps) => {
  const queryClient = useQueryClient();

  // Fetch plan data when in update mode
  const {
    data: plan,
    isLoading: isLoadingPlan,
    error: planError,
  } = useQuery({
    queryKey: [queryKeys.admin.plans, planId],
    queryFn: async () => {
      if (!planId) return null;
      const response = await apiClient.api.plans[':id'].$get({
        param: { id: planId },
      });
      const result = await response.json();
      if (!response.ok) {
        const error = result as unknown as { message?: string };
        throw new Error(error?.message || 'Failed to fetch plan');
      }
      return result;
    },
    enabled: mode === 'update' && !!planId,
  });

  const form = useForm<z.infer<typeof planFormSchema>>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      name: '',
      description: '',
      price: undefined,
      features: [],
      credits: undefined,
      status: 'active',
      isPopular: false,
      order: 0,
    },
  });

  // Reset form when plan data changes
  useEffect(() => {
    if (plan && mode === 'update') {
      form.reset({
        name: plan.name,
        description: plan.description,
        price: plan.price ?? undefined,
        features: plan.features ?? [],
        credits: plan.credits ?? 0,
        status: plan.status ?? 'active',
        isPopular: plan.isPopular ?? false,
        order: plan.order ?? 0,
      });
    }
  }, [plan]);

  const { mutate: createPlan, isPending: isCreating } = useMutation({
    mutationFn: async (data: z.infer<typeof planFormSchema>) => {
      const response = await apiClient.api.plans.$post({
        json: data,
      });
      const result = await response.json();
      if (!response.ok) {
        const error = result as unknown as { message?: string };
        throw new Error(error?.message || 'Failed to create plan');
      }
      return result;
    },
    onSuccess: () => {
      toast.success('Plan created successfully');
      onClose();
      queryClient.invalidateQueries({ queryKey: [queryKeys.admin.plans] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create plan');
    },
  });

  const { mutate: updatePlan, isPending: isUpdating } = useMutation({
    mutationFn: async (data: z.infer<typeof planFormSchema>) => {
      if (mode === 'update' && planId) {
        const response = await apiClient.api.plans[':id'].$put({
          param: { id: planId },
          json: data,
        });
        const result = await response.json();
        if (!response.ok) {
          const error = result as unknown as { message?: string };
          throw new Error(error?.message || 'Failed to update plan');
        }
        return result;
      } else {
        throw new Error('Plan ID is required for update');
      }
    },
    onSuccess: () => {
      toast.success('Plan updated successfully');
      onClose();
      queryClient.invalidateQueries({ queryKey: [queryKeys.admin.plans] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update plan');
    },
  });

  const handleSubmit = (data: z.infer<typeof planFormSchema>) => {
    if (mode === 'create') {
      createPlan(data);
    } else {
      updatePlan(data);
    }
  };

  const onSubmit = form.handleSubmit(handleSubmit);

  const isSubmitting = isCreating || isUpdating;
  const isLoading = isLoadingPlan;

  useEffect(() => {
    if (planError) {
      toast.error(planError.message || 'Failed to fetch plan');
    }
  }, [planError]);

  return {
    form,
    onSubmit,
    handleSubmit,
    isSubmitting,
    isCreating,
    isUpdating,
    isLoading,
    plan,
    planFormSchema,
  };
};
