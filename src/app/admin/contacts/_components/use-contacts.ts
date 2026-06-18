import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useEffect, useState } from 'react';
import { SortOrder } from '@/lib/schema';
import { queryKeys } from '@/data/constans';
import { toast } from 'sonner';
import { ContactStatus } from '@prisma/client';

interface ContactFilters {
  page: number;
  limit: number;
  sort?: string;
  order?: SortOrder;
  search: string;
  status: string[];
}

export const useContacts = () => {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [filters, setFilters] = useState<ContactFilters>({
    page: 1,
    limit: 15,
    sort: undefined,
    order: undefined,
    search: '',
    status: [],
  });

  const setFilter = (filter: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, page: 1, ...filter }));
  };

  const { data, isFetching, error } = useQuery({
    queryKey: [queryKeys.admin.contacts, filters],
    queryFn: async () => {
      const response = await apiClient.api.contacts.$get({
        query: {
          page: filters.page.toString(),
          limit: filters.limit.toString(),
          ...(filters.sort && { sort: filters.sort }),
          ...(filters.order && { order: filters.order }),
          ...(filters.search && { search: filters.search }),
          ...(filters.status.length && { status: filters.status.join(',') }),
        },
      });
      const result = await response.json();
      if (!response.ok) {
        const error = result as unknown as { message?: string };
        throw new Error(error?.message || 'Failed to fetch contact messages');
      }

      return result;
    },
  });

  const { mutate: deleteContacts, isPending: isDeleting } = useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await apiClient.api.contacts.$delete({
        json: { ids },
      });
      const result = await response.json();
      if (!response.ok) {
        const error = result as unknown as { message?: string };
        throw new Error(error?.message || 'Failed to delete contact messages');
      }

      return result;
    },
    onSuccess: () => {
      setSelected([]);
      setShowDeleteDialog(false);
      toast.success('Contact messages deleted successfully');
      queryClient.invalidateQueries({ queryKey: [queryKeys.admin.contacts] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete contact messages');
    },
  });

  useEffect(() => {
    setSelected([]);
  }, [filters]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Failed to fetch contacts');
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
    selectedContact,
    setSelectedContact,
    deleteContacts,
    isDeleting,
  };
};

export const useContact = (contactId: string) => {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: [queryKeys.admin.contacts, contactId],
    queryFn: async () => {
      const response = await apiClient.api.contacts[':id'].$get({
        param: { id: contactId },
      });
      const result = await response.json();
      if (!response.ok) {
        const error = result as unknown as { message?: string };
        throw new Error(error?.message || 'Failed to fetch contact message');
      }

      return result;
    },
  });

  const { mutate: updateStatus, isPending: isUpdating } = useMutation({
    mutationFn: async (status: ContactStatus) => {
      const response = await apiClient.api.contacts[':id'].$put({
        param: { id: contactId },
        json: { status },
      });
      const result = await response.json();
      if (!response.ok) {
        const error = result as unknown as { message?: string };
        throw new Error(error?.message || 'Failed to update contact status');
      }
    },
    onSuccess: () => {
      toast.success('Contact status updated successfully');
      queryClient.invalidateQueries({ queryKey: [queryKeys.admin.contacts] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update contact status');
    },
  });

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Failed to fetch contact message');
    }
  }, [error]);

  return { data, isLoading, updateStatus, isUpdating };
};
