import { Hono } from 'hono';
import postSchema from './post-schema';
import postService from './post-service';
import { zValidator } from '@/lib/middlewares/zod-validator';
import { isAdmin } from '@/lib/middlewares/auth';

const postRoutes = new Hono()
  .get(`/`, zValidator('query', postSchema.postQuerySchema), isAdmin, async (c) => {
    const query = c.req.valid('query');
    const post = await postService.queryPosts(query);
    return c.json(post);
  })
  .get(`/:id`, isAdmin, async (c) => {
    const id = c.req.param('id');
    const post = await postService.getPost(id);
    return c.json(post);
  })
  .post(`/`, isAdmin, zValidator('json', postSchema.createPostSchema), async (c) => {
    const body = c.req.valid('json');
    const post = await postService.createPost(body);
    return c.json(post);
  })
  .put(`/:id`, isAdmin, zValidator('json', postSchema.updatePostSchema), async (c) => {
    const id = c.req.param('id');
    const body = c.req.valid('json');
    const post = await postService.updatePost(id, body);
    return c.json(post);
  })
  .delete(`/`, isAdmin, zValidator('json', postSchema.deletePostSchema), async (c) => {
    const { ids } = c.req.valid('json');
    await postService.deletePost(ids);
    return c.json({ message: 'Posts deleted successfully' });
  });

export default postRoutes;
