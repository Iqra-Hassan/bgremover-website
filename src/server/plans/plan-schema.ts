import { z } from 'zod';

import { commonPaginationSchema } from '@/lib/schema';
import { PlanStatus } from '@prisma/client';

const planQuerySchema = commonPaginationSchema;

const createPlanSchema = z
  .object({
    name: z.string().nonempty(),
    description: z.string().nonempty(),
    price: z.number(),
    features: z.array(z.string().nonempty()),
    status: z.nativeEnum(PlanStatus),
    order: z.number().min(0),
    credits: z.number().min(0),
    isPopular: z.boolean(),
  })
  .strict();

const updatePlanSchema = createPlanSchema;

const deletePlanSchema = z.object({
  ids: z.array(z.string().nonempty()).min(1),
});

export default { planQuerySchema, createPlanSchema, updatePlanSchema, deletePlanSchema };
