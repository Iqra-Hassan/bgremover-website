import { Hono } from 'hono';
import settingSchema from './setting-schema';
import settingsService from './setting-service';
import { zValidator } from '@/lib/middlewares/zod-validator';
import { uploadService } from '@/lib/services/upload-service';
import mailService from '@/lib/services/mail-service';
import { invalidateAuthSettingsCache } from '@/lib/auth';
import { isAdmin } from '@/lib/middlewares/auth';
import billingService from '@/lib/services/payment-service';

const settingRoutes = new Hono()
  .get(`/general`, isAdmin, async (c) => {
    const general = await settingsService.getSetting('general');
    return c.json(general);
  })
  .put(`/general`, isAdmin, zValidator('json', settingSchema.generalSettingsSchema), async (c) => {
    const body = c.req.valid('json');
    await settingsService.saveSettings('general', body);
    return c.json({ message: 'Settings saved successfully' });
  })
  .get(`/storage`, isAdmin, async (c) => {
    const storage = await settingsService.getSetting('storage');
    return c.json(storage);
  })
  .put(`/storage`, isAdmin, zValidator('json', settingSchema.storageSettingsSchema), async (c) => {
    const body = c.req.valid('json');
    await settingsService.saveSettings('storage', body);
    // If storage settings are updated, notify the upload service
    await uploadService.setStorageSettings(body);
    return c.json({ message: 'Settings saved successfully' });
  })
  .get(`/auth`, isAdmin, async (c) => {
    const auth = await settingsService.getSetting('auth');
    return c.json(auth);
  })
  .put(`/auth`, isAdmin, zValidator('json', settingSchema.authSettingsSchema), async (c) => {
    const body = c.req.valid('json');
    await settingsService.saveSettings('auth', body);
    // Invalidate auth settings cache
    invalidateAuthSettingsCache();
    return c.json({ message: 'Settings saved successfully' });
  })
  .get(`/billing`, isAdmin, async (c) => {
    const billing = await settingsService.getSetting('billing');
    return c.json(billing);
  })
  .put(`/billing`, isAdmin, zValidator('json', settingSchema.billingSettingsSchema), async (c) => {
    const body = c.req.valid('json');
    await settingsService.saveSettings('billing', body);
    // If billing settings are updated, notify the billing service
    await billingService.setBillingSettings(body);
    return c.json({ message: 'Settings saved successfully' });
  })
  .get(`/mail`, isAdmin, async (c) => {
    const mail = await settingsService.getSetting('mail');
    return c.json(mail);
  })
  .put(`/mail`, isAdmin, zValidator('json', settingSchema.mailSettingsSchema), async (c) => {
    const body = c.req.valid('json');
    await settingsService.saveSettings('mail', body);
    // If mail settings are updated, notify the mail service
    await mailService.setMailSettings(body);
    return c.json({ message: 'Settings saved successfully' });
  })
  .get(`/advanced`, isAdmin, async (c) => {
    const advanced = await settingsService.getSetting('advanced');
    return c.json(advanced);
  })
  .put(
    `/advanced`,
    isAdmin,
    zValidator('json', settingSchema.advancedSettingsSchema),
    async (c) => {
      const body = c.req.valid('json');
      await settingsService.saveSettings('advanced', body);
      return c.json({ message: 'Settings saved successfully' });
    },
  )
  .get(`/legal`, isAdmin, async (c) => {
    const legal = await settingsService.getSetting('legal');
    return c.json(legal);
  })
  .put(`/legal`, isAdmin, zValidator('json', settingSchema.legalSettingsSchema), async (c) => {
    const body = c.req.valid('json');
    await settingsService.saveSettings('legal', body);
    return c.json({ message: 'Settings saved successfully' });
  });

export default settingRoutes;
