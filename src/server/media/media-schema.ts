import { z } from 'zod';

import { commonPaginationSchema } from '@/lib/schema';

const mediaQuerySchema = commonPaginationSchema.extend({
  allowTypes: z.string().optional(),
});

const deleteMediaSchema = z.object({
  ids: z.array(z.string().nonempty()).min(1),
});

export default { mediaQuerySchema, deleteMediaSchema };
