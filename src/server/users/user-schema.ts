import { userRoles } from '@/data/constans';
import { commonPaginationSchema } from '@/lib/schema';
import { z } from 'zod';

const userQuerySchema = commonPaginationSchema;
const userPaymentsQuerySchema = commonPaginationSchema;
const historyQuerySchema = commonPaginationSchema;

const updateProfileSchema = z.object({
  image: z.instanceof(File).optional(),
  name: z.string().nonempty(),
});

const updateUserSchema = z.object({
  name: z.string().nonempty(),
  email: z.string().email(),
  role: z.enum(userRoles),
  emailVerified: z.boolean().optional(),
  credits: z.number().optional(),
});

const deleteUsersSchema = z.object({
  ids: z.array(z.string()),
});

export default {
  userQuerySchema,
  userPaymentsQuerySchema,
  historyQuerySchema,
  updateUserSchema,
  updateProfileSchema,
  deleteUsersSchema,
};
