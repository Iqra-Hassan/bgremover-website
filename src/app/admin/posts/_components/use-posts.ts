import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useEffect, useState } from 'react';
import { SortOrder } from '@/lib/schema';
import { queryKeys } from '@/data/constans';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PostStatus } from '@prisma/client';

interface PostFilters {
  page: number;
  limit: number;
  sort?: string;
  order?: SortOrder;
  search: string;
  status: string[];
}

export const usePosts = () => {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [filters, setFilters] = useState<PostFilters>({
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
    queryKey: [queryKeys.admin.posts, filters],
    queryFn: async () => {
      const response = await apiClient.api.posts.$get({
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
        throw new Error(error?.message || 'Failed to fetch posts');
      }

      return result;
    },
  });

  const { mutate: deletePosts, isPending: isDeleting } = useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await apiClient.api.posts.$delete({
        json: { ids },
      });
      const result = await response.json();
      if (!response.ok) {
        const error = result as unknown as { message?: string };
        throw new Error(error?.message || 'Failed to delete posts');
      }

      return result;
    },
    onSuccess: () => {
      setSelected([]);
      setShowDeleteDialog(false);
      toast.success('Posts deleted successfully');
      queryClient.invalidateQueries({ queryKey: [queryKeys.admin.posts] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete posts');
    },
  });

  useEffect(() => {
    setSelected([]);
  }, [filters]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Failed to fetch posts');
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
    selectedPost,
    setSelectedPost,
    deletePosts,
    isDeleting,
  };
};

interface UsePostFormProps {
  mode: 'create' | 'update';
  postId?: string | null;
  onClose: () => void;
}

const postFormSchema = z.object({
  title: z.string().nonempty('Title is required'),
  slug: z.string().nonempty('Slug is required'),
  excerpt: z.string().optional(),
  thumbnail: z.string().optional(),
  content: z.string().nonempty('Content is required'),
  status: z.nativeEnum(PostStatus),
});

export const usePostForm = ({ mode, postId, onClose }: UsePostFormProps) => {
  const queryClient = useQueryClient();

  // Fetch post data when in update mode
  const {
    data: post,
    isLoading: isLoadingPost,
    error: postError,
  } = useQuery({
    queryKey: [queryKeys.admin.posts, postId],
    queryFn: async () => {
      if (!postId) return null;
      const response = await apiClient.api.posts[':id'].$get({
        param: { id: postId },
      });
      const result = await response.json();
      if (!response.ok) {
        const error = result as unknown as { message?: string };
        throw new Error(error?.message || 'Failed to fetch post');
      }
      return result;
    },
    enabled: mode === 'update' && !!postId,
  });

  const form = useForm<z.infer<typeof postFormSchema>>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      thumbnail: '',
      content: '',
      status: 'published',
    },
  });

  // Reset form when post data changes
  useEffect(() => {
    if (post && mode === 'update') {
      form.reset({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt ?? '',
        thumbnail: post.thumbnail ?? '',
        content: post.content,
        status: post.status,
      });
    }
  }, [post]);

  const { mutate: createPost, isPending: isCreating } = useMutation({
    mutationFn: async (data: z.infer<typeof postFormSchema>) => {
      const response = await apiClient.api.posts.$post({
        json: data,
      });
      const result = await response.json();
      if (!response.ok) {
        const error = result as unknown as { message?: string };
        throw new Error(error?.message || 'Failed to create post');
      }
      return result;
    },
    onSuccess: () => {
      toast.success('Post created successfully');
      onClose();
      queryClient.invalidateQueries({ queryKey: [queryKeys.admin.posts] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create post');
    },
  });

  const { mutate: updatePost, isPending: isUpdating } = useMutation({
    mutationFn: async (data: z.infer<typeof postFormSchema>) => {
      if (mode === 'update' && postId) {
        const response = await apiClient.api.posts[':id'].$put({
          param: { id: postId },
          json: data,
        });
        const result = await response.json();
        if (!response.ok) {
          const error = result as unknown as { message?: string };
          throw new Error(error?.message || 'Failed to update post');
        }
        return result;
      } else {
        throw new Error('Post ID is required for update');
      }
    },
    onSuccess: () => {
      toast.success('Post updated successfully');
      onClose();
      queryClient.invalidateQueries({ queryKey: [queryKeys.admin.posts] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update post');
    },
  });

  const handleSubmit = (data: z.infer<typeof postFormSchema>) => {
    if (mode === 'create') {
      createPost(data);
    } else {
      updatePost(data);
    }
  };

  const onSubmit = form.handleSubmit(handleSubmit);

  const isSubmitting = isCreating || isUpdating;
  const isLoading = isLoadingPost;

  useEffect(() => {
    if (postError) {
      toast.error(postError.message || 'Failed to fetch post');
    }
  }, [postError]);

  return {
    form,
    onSubmit,
    handleSubmit,
    isSubmitting,
    isCreating,
    isUpdating,
    isLoading,
    post,
    postFormSchema,
  };
};
