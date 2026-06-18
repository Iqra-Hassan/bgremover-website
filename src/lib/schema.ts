import { z } from 'zod';

export const passwordSchema = z
  .string()
  .nonempty('Password is required')
  .min(6, `Password must be at least ${6} characters`)
  .max(32, 'Password must be at most 32 characters');

export const commonPaginationSchema = z.object({
  page: z.coerce
    .number()
    .positive('Must be a positive number and greater than 0.')
    .int()
    .min(1)
    .default(1),
  limit: z.coerce
    .number()
    .positive('Must be a positive number and greater than 0.')
    .int()
    .min(1)
    .max(100)
    .default(10),
  search: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export type SortOrder = z.infer<typeof commonPaginationSchema>['order'];
