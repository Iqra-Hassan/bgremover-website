import { Hono } from 'hono';
import mediaSchema from './media-schema';
import mediaService from './media-service';
import { zValidator } from '@/lib/middlewares/zod-validator';
import { isAdmin } from '@/lib/middlewares/auth';

const mediaRoutes = new Hono()
  .get(`/`, zValidator('query', mediaSchema.mediaQuerySchema), isAdmin, async (c) => {
    const query = c.req.valid('query');
    const media = await mediaService.queryMedia(query);
    return c.json(media);
  })
  .get(`/:id`, isAdmin, async (c) => {
    const id = c.req.param('id');
    const media = await mediaService.getMedia(id);
    return c.json(media);
  })
  .post(`/`, isAdmin, async (c) => {
    const media = await mediaService.createMedia(c);
    return c.json(media);
  })
  .delete(`/`, isAdmin, zValidator('json', mediaSchema.deleteMediaSchema), async (c) => {
    const { ids } = c.req.valid('json');
    await mediaService.deleteMedia(ids);
    return c.json({ message: 'Media deleted successfully' });
  });

export default mediaRoutes;
