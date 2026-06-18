import { billingProviders } from '@/data/constans';
import { commonPaginationSchema } from '@/lib/schema';
import { z } from 'zod';

const paymentsQuerySchema = commonPaginationSchema.extend({
  status: z.string().optional(),
});

const createCheckoutSchema = z.object({
  planId: z.string().nonempty('Plan ID is required'),
});

const webhookSchema = z.object({
  provider: z.enum(billingProviders),
});

export default {
  createCheckoutSchema,
  webhookSchema,
  paymentsQuerySchema,
};
