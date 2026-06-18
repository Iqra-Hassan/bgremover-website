import { Hono } from 'hono';
import userService from './user-service';
import userSchema from './user-schema';
import { zValidator } from '@/lib/middlewares/zod-validator';
import { isAuthenticated, isAdmin } from '@/lib/middlewares/auth';

const settingRoutes = new Hono()
  .put(`/me`, isAuthenticated, zValidator('form', userSchema.updateProfileSchema), async (c) => {
    const user = c.get('user');
    const body = c.req.valid('form');
    await userService.updateProfile(user.id, body);
    return c.json({ message: 'Profile updated successfully' });
  })
  .get(`/`, isAdmin, zValidator('query', userSchema.userQuerySchema), async (c) => {
    const query = c.req.valid('query');
    const users = await userService.queryUsers(query);
    return c.json(users);
  })
  .get(`/credits`, isAuthenticated, async (c) => {
    const user = c.get('user');
    const credits = await userService.getUserCredits(user.id);
    return c.json({ credits });
  })
  .get(
    `/payments`,
    isAuthenticated,
    zValidator('query', userSchema.userPaymentsQuerySchema),
    async (c) => {
      const user = c.get('user');
      const query = c.req.valid('query');
      const payments = await userService.getUserPayments(user.id, query);
      return c.json(payments);
    },
  )
  .get(
    `/history`,
    isAuthenticated,
    zValidator('query', userSchema.historyQuerySchema),
    async (c) => {
      const user = c.get('user');
      const query = c.req.valid('query');
      const history = await userService.queryHistory(query, user.id);
      return c.json(history);
    },
  )
  .delete(`/history/:id`, isAuthenticated, async (c) => {
    const { id } = c.req.param();
    const user = c.get('user');
    await userService.deleteHistory(id, user.id);
    return c.json({ message: 'History deleted successfully' });
  })
  .get(`/:id`, isAdmin, async (c) => {
    const { id } = c.req.param();
    const user = await userService.getUser(id);
    return c.json(user);
  })
  .put(`/:id`, isAdmin, zValidator('json', userSchema.updateUserSchema), async (c) => {
    const { id } = c.req.param();
    const body = c.req.valid('json');
    await userService.updateUser(id, body);
    return c.json({ message: 'User updated successfully' });
  })
  .delete(`/`, isAdmin, zValidator('json', userSchema.deleteUsersSchema), async (c) => {
    const { ids } = c.req.valid('json');
    const user = c.get('user');
    await userService.deleteUsers(ids, user.id);
    return c.json({ message: 'Users deleted successfully' });
  });

export default settingRoutes;
