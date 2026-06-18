import { Hono } from 'hono';
import billingSchema from './billing-schema';
import billingService from './billing-service';
import { zValidator } from '@/lib/middlewares/zod-validator';
import { isAdmin, isAuthenticated } from '@/lib/middlewares/auth';
import { BillingProvider } from '@/data/constans';

const billingRoutes = new Hono()
  .post(
    `/checkout`,
    zValidator('json', billingSchema.createCheckoutSchema),
    isAuthenticated,
    async (c) => {
      const body = c.req.valid('json');
      const user = c.get('user');
      const checkout = await billingService.createCheckout(body, user.id);
      return c.json({ url: checkout.url });
    },
  )
  .post(`/webhook/:provider`, zValidator('param', billingSchema.webhookSchema), async (c) => {
    const provider = c.req.param('provider') as BillingProvider;
    const result = await billingService.handleWebhook(c, provider);
    return c.json(result);
  })
  .get(`/payments`, isAdmin, zValidator('query', billingSchema.paymentsQuerySchema), async (c) => {
    const query = c.req.valid('query');
    const payments = await billingService.getPayments(query);
    return c.json(payments);
  });

export default billingRoutes;
