import { Hono } from 'hono';
import planSchema from './plan-schema';
import planService from './plan-service';
import { zValidator } from '@/lib/middlewares/zod-validator';
import { isAdmin } from '@/lib/middlewares/auth';

const planRoutes = new Hono()
  .get(`/public`, async (c) => {
    const plans = await planService.getPublicPlans();
    return c.json(plans);
  })
  .get(`/`, zValidator('query', planSchema.planQuerySchema), isAdmin, async (c) => {
    const query = c.req.valid('query');
    const plan = await planService.queryPlans(query);
    return c.json(plan);
  })
  .get(`/:id`, isAdmin, async (c) => {
    const id = c.req.param('id');
    const plan = await planService.getPlan(id);
    return c.json({
      ...plan,
      features: plan.features as string[],
    });
  })
  .post(`/`, isAdmin, zValidator('json', planSchema.createPlanSchema), async (c) => {
    const body = c.req.valid('json');
    const plan = await planService.createPlan(body);
    return c.json(plan);
  })
  .put(`/:id`, isAdmin, zValidator('json', planSchema.updatePlanSchema), async (c) => {
    const id = c.req.param('id');
    const body = c.req.valid('json');
    const plan = await planService.updatePlan(id, body);
    return c.json(plan);
  })
  .delete(`/`, isAdmin, zValidator('json', planSchema.deletePlanSchema), async (c) => {
    const body = c.req.valid('json');
    await planService.deletePlan(body);
    return c.json({ message: 'Plans deleted successfully' });
  });

export default planRoutes;
