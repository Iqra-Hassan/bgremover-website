import { z } from 'zod';

import { passwordSchema } from '@/lib/schema';

const setupAppSchema = z.object({
  applicationName: z.string().nonempty('Application Name is required'),
  adminEmail: z.string().email().nonempty('Admin Email is required'),
  adminPassword: passwordSchema,
});

const removeObjectSchema = z
  .object({
    image: z.instanceof(File).optional(),
    imageUrl: z.string().optional(),
    mask: z.instanceof(File),
    isPro: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.image && !data.imageUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Either image or imageUrl is required',
      });
    }
  });

const eraseBgSchema = z.object({
  image: z.instanceof(File).optional(),
  isPro: z.string().optional(),
});

const upscaleImageSchema = z.object({
  image: z.instanceof(File),
  isPro: z.string().optional(),
});

export default {
  setupAppSchema,
  removeObjectSchema,
  eraseBgSchema,
  upscaleImageSchema,
};
