import { Hono } from 'hono';
import { compress } from 'hono/compress';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { handle } from 'hono/vercel';
import { serveStatic } from 'hono/serve-static';
import { join } from 'path';
import { stat } from 'fs/promises';
import { existsSync, createReadStream } from 'fs';
import { lookup } from 'mime-types';
import { notFount, handleApiError } from '@/lib/error-handle';
import { getAuth } from '@/lib/auth';
import settingRoutes from '@/server/settings/setting-routes';
import userRoutes from '@/server/users/user-routes';
import mediaRoutes from '@/server/media/media-routes';
import planRoutes from '@/server/plans/plan-routes';
import postRoutes from '@/server/posts/post-routes';
import contactRoutes from '@/server/contact/contact-routes';
import billingRoutes from '@/server/billing/billing-routes';
import commonRoutes from '@/server/common/common-routes';

const app = new Hono().basePath('/api');

app.use(compress());
app.use(cors());
app.use(secureHeaders());

// static files
app.use(
  `/media/*`,
  serveStatic({
    root: './uploads',
    getContent: async (path, c) => {
      try {
        const filename = path.split('/').pop();
        if (!filename) {
          return null;
        }
        const filePath = join(process.cwd(), 'uploads', filename);

        if (!existsSync(filePath)) {
          return null;
        }

        const stats = await stat(filePath);
        const mimeType = lookup(filePath) || 'application/octet-stream';
        const stream = createReadStream(filePath);

        c.header('Cache-Control', 'public, max-age=31536000'); // 1 year
        c.header('Content-Disposition', `attachment; filename="${filename}"`);

        c.header('Content-Type', mimeType);
        c.header('Content-Length', stats.size.toString());

        return new Response(stream as any);
      } catch (error) {
        console.error('Error serving static file:', error);
        return null;
      }
    },
  }),
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const routes = app
  .on(['POST', 'GET'], '/auth/*', async (c) => {
    const auth = await getAuth();
    return auth.handler(c.req.raw);
  })
  .route('/settings', settingRoutes)
  .route('/users', userRoutes)
  .route('/contacts', contactRoutes)
  .route('/posts', postRoutes)
  .route('/plans', planRoutes)
  .route('/media', mediaRoutes)
  .route('/billing', billingRoutes)
  .route('/common', commonRoutes)
  .notFound(notFount)
  .onError(handleApiError);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const PATCH = handle(app);
export const OPTIONS = handle(app);

export type ApiTypes = typeof routes;
