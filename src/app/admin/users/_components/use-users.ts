import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useEffect, useState } from 'react';
import { SortOrder } from '@/lib/schema';
import { queryKeys, UserRole, userRoles } from '@/data/constans';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authClient } from '@/lib/auth-client';

interface UserFilters {
  page: number;
  limit: number;
  sort?: string;
  order?: SortOrder;
  search: string;
}

export const useUsers = (limit?: number) => {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: limit || 15,
    sort: undefined,
    order: undefined,
    search: '',
  });

  const setFilter = (filter: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, page: 1, ...filter }));
  };

  const { data, isFetching, error } = useQuery({
    queryKey: [queryKeys.admin.users, filters],
    queryFn: async () => {
      const response = await apiClient.api.users.$get({
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
        throw new Error(error?.message || 'Failed to fetch users');
      }

      return result;
    },
  });

  const { mutate: deleteUsers, isPending: isDeleting } = useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await apiClient.api.users.$delete({
        json: { ids },
      });
      const result = await response.json();
      if (!response.ok) {
        const error = result as unknown as { message?: string };
        throw new Error(error?.message || 'Failed to delete users');
      }

      return result;
    },
    onSuccess: () => {
      setSelected([]);
      setShowDeleteDialog(false);
      toast.success('Users deleted successfully');
      queryClient.invalidateQueries({ queryKey: [queryKeys.admin.users] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete users');
    },
  });

  useEffect(() => {
    setSelected([]);
  }, [filters]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Failed to fetch users');
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
    selectedUser,
    setSelectedUser,
    deleteUsers,
    isDeleting,
  };
};

interface UseUserFormProps {
  mode: 'create' | 'update';
  userId?: string | null;
  onClose: () => void;
}

export const useUserForm = ({ mode, userId, onClose }: UseUserFormProps) => {
  const queryClient = useQueryClient();

  const userFormSchema = z
    .object({
      name: z.string().nonempty('Name is required'),
      email: z.string().email('Invalid email address'),
      role: z.enum(userRoles),
      emailVerified: z.boolean().optional(),
      password: z.string().optional(),
      credits: z.number().optional(),
    })
    .superRefine((data, ctx) => {
      if (mode === 'create' && (!data.password || data.password.length < 6)) {
        ctx.addIssue({
          path: ['password'],
          code: z.ZodIssueCode.custom,
          message: 'Password must be at least 6 characters',
        });
      }
    });

  // Fetch user data when in update mode
  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
  } = useQuery({
    queryKey: [queryKeys.admin.users, userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await apiClient.api.users[':id'].$get({
        param: { id: userId },
      });
      const result = await response.json();
      if (!response.ok) {
        const error = result as unknown as { message?: string };
        throw new Error(error?.message || 'Failed to fetch user');
      }
      return result;
    },
    enabled: mode === 'update' && !!userId,
  });

  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'user',
      ...(mode === 'create' && { password: '' }),
      credits: 0,
    },
  });

  // Reset form when user data changes
  useEffect(() => {
    if (user && mode === 'update') {
      form.reset({
        name: user.name,
        email: user.email,
        role: (user.role || 'user') as UserRole,
        emailVerified: user.emailVerified,
        credits: user.credits,
      });
    }
  }, [user]);

  const { mutate: createUser, isPending: isCreating } = useMutation({
    mutationFn: async (data: z.infer<typeof userFormSchema>) => {
      const { error } = await authClient.admin.createUser({
        ...data,
        password: data.password || '',
      });
      if (error) {
        throw new Error(error.message || 'Failed to create user');
      }
    },
    onSuccess: () => {
      toast.success('User created successfully');
      onClose();
      queryClient.invalidateQueries({ queryKey: [queryKeys.admin.users] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create user');
    },
  });

  const { mutate: updateUser, isPending: isUpdating } = useMutation({
    mutationFn: async (data: z.infer<typeof userFormSchema>) => {
      if (mode === 'update' && userId) {
        const response = await apiClient.api.users[':id'].$put({
          param: { id: userId },
          json: data,
        });
        const result = await response.json();
        if (!response.ok) {
          const error = result as unknown as { message?: string };
          throw new Error(error?.message || 'Failed to update user');
        }
        return result;
      } else {
        throw new Error('User ID is required for update');
      }
    },
    onSuccess: () => {
      toast.success('User updated successfully');
      onClose();
      queryClient.invalidateQueries({ queryKey: [queryKeys.admin.users] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update user');
    },
  });

  const handleSubmit = (data: z.infer<typeof userFormSchema>) => {
    if (mode === 'create') {
      createUser(data);
    } else {
      updateUser(data);
    }
  };

  const onSubmit = form.handleSubmit(handleSubmit);

  const isSubmitting = isCreating || isUpdating;
  const isLoading = isLoadingUser;

  useEffect(() => {
    if (userError) {
      toast.error(userError.message || 'Failed to fetch user');
    }
  }, [userError]);

  return {
    form,
    onSubmit,
    handleSubmit,
    isSubmitting,
    isCreating,
    isUpdating,
    isLoading,
    user,
    userFormSchema,
  };
};
