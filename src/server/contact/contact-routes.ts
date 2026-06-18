import { Hono } from 'hono';
import contactSchema from './contact-schema';
import contactService from './contact-service';
import { zValidator } from '@/lib/middlewares/zod-validator';
import { isAdmin } from '@/lib/middlewares/auth';

const contactRoutes = new Hono()
  .get(`/`, zValidator('query', contactSchema.contactQuerySchema), isAdmin, async (c) => {
    const query = c.req.valid('query');
    const contact = await contactService.queryContacts(query);
    return c.json(contact);
  })
  .get(`/:id`, isAdmin, async (c) => {
    const id = c.req.param('id');
    const contact = await contactService.getContact(id);
    return c.json(contact);
  })
  .post(`/`, zValidator('json', contactSchema.createContactSchema), async (c) => {
    const body = c.req.valid('json');
    await contactService.createContact(body);
    return c.json({ success: true });
  })
  .put(`/:id`, isAdmin, zValidator('json', contactSchema.updateContactSchema), async (c) => {
    const id = c.req.param('id');
    const body = c.req.valid('json');
    await contactService.updateContact(id, body);
    return c.json({ success: true });
  })
  .delete(`/`, isAdmin, zValidator('json', contactSchema.deleteContactSchema), async (c) => {
    const { ids } = c.req.valid('json');
    await contactService.deleteContact(ids);
    return c.json({ success: true });
  });

export default contactRoutes;
