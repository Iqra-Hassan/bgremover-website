import { Hono } from 'hono';
import { isAdmin, optionalAuth } from '@/lib/middlewares/auth';
import commonService from './common-service';
import commonSchema from './common-schema';
import { zValidator } from '@/lib/middlewares/zod-validator';

const commonRoutes = new Hono()
  .get(`/admin/stats`, isAdmin, async (c) => {
    const stats = await commonService.adminStats();
    return c.json(stats);
  })
  .get(`/remove-expired-edits`, async (c) => {
    await commonService.removeExpiredEdits();
    return c.json({ message: 'Expired edits removed' });
  })
  .get(`/expired-edits`, isAdmin, async (c) => {
    const expiredEdits = await commonService.expiredEdits();
    return c.json(expiredEdits);
  })
  .post(`/setup`, zValidator('json', commonSchema.setupAppSchema), async (c) => {
    const body = await c.req.valid('json');
    await commonService.setupApp(body);
    return c.json({ message: 'Setup completed' });
  })
  .post(
    `/remove-object`,
    optionalAuth,
    zValidator('form', commonSchema.removeObjectSchema),
    async (c) => {
      const body = await c.req.valid('form');
      const user = c.get('user');
      const result = await commonService.removeObject(body, user?.id);
      return c.json(result);
    },
  )
  .post(`/erase-bg`, optionalAuth, zValidator('form', commonSchema.eraseBgSchema), async (c) => {
    const body = await c.req.valid('form');
    const user = c.get('user');
    const result = await commonService.eraseBg(body, user?.id);
    return c.json(result);
  })
  .post(
    `/upscale-image`,
    optionalAuth,
    zValidator('form', commonSchema.upscaleImageSchema),
    async (c) => {
      const body = await c.req.valid('form');
      const user = c.get('user');
      const result = await commonService.upscaleImage(body, user?.id);
      return c.json(result);
    },
  );

export default commonRoutes;
