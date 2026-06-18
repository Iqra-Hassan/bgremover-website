import { z } from 'zod';

import { commonPaginationSchema } from '@/lib/schema';
import { PostStatus } from '@prisma/client';

const postQuerySchema = commonPaginationSchema.extend({
  status: z.string().optional(),
});

const createPostSchema = z.object({
  title: z.string().nonempty(),
  slug: z.string().nonempty(),
  excerpt: z.string().optional(),
  thumbnail: z.string().optional(),
  content: z.string().nonempty(),
  status: z.nativeEnum(PostStatus),
});

const updatePostSchema = createPostSchema;

const deletePostSchema = z.object({
  ids: z.array(z.string().nonempty()).min(1),
});

export default { postQuerySchema, createPostSchema, updatePostSchema, deletePostSchema };
