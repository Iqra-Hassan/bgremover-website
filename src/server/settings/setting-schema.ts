import { billingProviders, paypalModes } from '@/data/constans';
import { StorageType } from '@prisma/client';
import { z } from 'zod';

const generalSettingsSchema = z.object({
  applicationName: z.string().nonempty(),
  siteTitle: z.string().nonempty(),
  siteDescription: z.string().nonempty(),
  siteKeywords: z.array(z.string().min(1)).optional(),
  logo: z.string().optional(),
  logoDark: z.string().optional(),
  coverImage: z.string().optional(),
  favicon: z.string().optional(),
});

const authSettingsSchema = z
  .object({
    requireEmailVerification: z.boolean().default(true),
    allowGoogleSignIn: z.boolean(),
    googleClientId: z.string().optional(),
    googleClientSecret: z.string().optional(),
    allowFacebookSignIn: z.boolean(),
    facebookClientId: z.string().optional(),
    facebookClientSecret: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.allowGoogleSignIn) {
      if (!data.googleClientId || !data.googleClientSecret) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Google client ID and secret are required when Google sign-in is enabled.',
        });
      }
    }
    if (data.allowFacebookSignIn) {
      if (!data.facebookClientId || !data.facebookClientSecret) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Facebook client ID and secret are required when Facebook sign-in is enabled.',
        });
      }
    }
  });

const storageSettingsSchema = z
  .object({
    provider: z.nativeEnum(StorageType),
    s3Key: z.string().optional(),
    s3Secret: z.string().optional(),
    s3Region: z.string().optional(),
    s3Bucket: z.string().optional(),
    s3Folder: z.string().optional(),
    s3Endpoint: z.string().optional(),
    s3CustomDomain: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.provider === 's3') {
      if (!data.s3Key || !data.s3Secret || !data.s3Region || !data.s3Bucket || !data.s3Endpoint) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'S3 settings are incomplete. Please provide all required fields.',
        });
      }
    }
  });

const billingSettingsSchema = z
  .object({
    provider: z.enum(billingProviders),
    currency: z.string().nonempty(),
    stripeSecretKey: z.string().optional(),
    stripeWebhookSecret: z.string().optional(),
    paypalMode: z.enum(paypalModes).optional(),
    paypalClientId: z.string().optional(),
    paypalClientSecret: z.string().optional(),
    paypalWebhookId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.provider === 'stripe') {
      if (!data.stripeSecretKey || !data.stripeWebhookSecret) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Stripe settings are incomplete. Please provide all required fields.',
        });
      }
    }
    if (data.provider === 'paypal') {
      if (!data.paypalClientId || !data.paypalClientSecret || !data.paypalWebhookId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Paypal settings are incomplete. Please provide all required fields.',
        });
      }
    }
  });

const mailSettingsSchema = z
  .object({
    enableMail: z.boolean().default(false),
    senderName: z.string().optional(),
    senderEmail: z.union([z.literal(''), z.string().email()]).optional(),
    smtpHost: z.string().optional(),
    smtpPort: z.number().optional(),
    smtpUser: z.string().optional(),
    smtpPassword: z.string().optional(),
    smtpSecure: z.boolean().optional(),
    adminEmails: z.array(z.string().email()).optional(),
    enableContactNotifications: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.enableMail) {
      if (
        !data.senderName ||
        !data.senderEmail ||
        !data.smtpHost ||
        !data.smtpPort ||
        !data.smtpUser ||
        !data.smtpPassword
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Mail settings are incomplete. Please provide all required fields.',
        });
      }
    }
  });

const legalSettingsSchema = z.object({
  termsOfService: z.string().optional(),
  privacyPolicy: z.string().optional(),
});

const advancedSettingsSchema = z
  .object({
    aiApiKey: z.string().optional(),
    bgRemoverProvider: z.enum(['replicate', 'local']),
  })
  .superRefine((data, ctx) => {
    if (data.bgRemoverProvider === 'replicate' && !data.aiApiKey) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['aiApiKey'],
        message: 'API key is required when Replicate is selected.',
      });
    }
  });

export const settingsMap = {
  general: generalSettingsSchema,
  storage: storageSettingsSchema,
  auth: authSettingsSchema,
  billing: billingSettingsSchema,
  mail: mailSettingsSchema,
  legal: legalSettingsSchema,
  advanced: advancedSettingsSchema,
} as const;
export type SettingsKey = keyof typeof settingsMap;
export type SettingsDataMap = {
  [K in keyof typeof settingsMap]: z.infer<(typeof settingsMap)[K]>;
};

export const settingsKeys = Object.keys(settingsMap) as [keyof typeof settingsMap];
export default {
  generalSettingsSchema,
  storageSettingsSchema,
  authSettingsSchema,
  billingSettingsSchema,
  mailSettingsSchema,
  legalSettingsSchema,
  advancedSettingsSchema,
};
