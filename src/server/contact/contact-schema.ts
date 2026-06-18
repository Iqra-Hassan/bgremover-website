import { z } from 'zod';

import { commonPaginationSchema } from '@/lib/schema';
import { ContactStatus } from '@prisma/client';

const contactQuerySchema = commonPaginationSchema.extend({
  status: z.string().optional(),
});

const createContactSchema = z
  .object({
    name: z.string().nonempty(),
    email: z.string().email(),
    subject: z.string().nonempty(),
    message: z.string().nonempty(),
  })
  .strict();

const updateContactSchema = z.object({
  status: z.nativeEnum(ContactStatus).optional(),
});

const deleteContactSchema = z.object({
  ids: z.array(z.string().nonempty()).min(1),
});

export default {
  contactQuerySchema,
  createContactSchema,
  deleteContactSchema,
  updateContactSchema,
};
