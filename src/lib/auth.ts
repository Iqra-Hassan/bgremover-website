import { betterAuth, BetterAuthOptions } from 'better-auth';
import { APIError } from 'better-auth/api';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { passkey } from 'better-auth/plugins/passkey';
import { admin } from 'better-auth/plugins';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';
import settingsService from '@/server/settings/setting-service';
import { User as BetterAuthUser, Session as BetterAuthSession } from 'better-auth';
import mailService from '@/lib/services/mail-service';
import { emailVerificationTemplate, resetPasswordTemplate } from '@/data/email-templates';

// Cache for auth settings
let authSettingsCache: Awaited<ReturnType<typeof settingsService.getSetting<'auth'>>> | null = null;

// Function to invalidate cache
export const invalidateAuthSettingsCache = () => {
  authSettingsCache = null;
};

const getAuthConfig = async (): Promise<BetterAuthOptions> => {
  try {
    // Use cached settings if available
    const authSettings = authSettingsCache || (await settingsService.getSetting('auth'));

    // Update cache
    authSettingsCache = authSettings;
  } catch {
    // If fetching settings fails, use default values
  }

  return {
    database: prismaAdapter(prisma, {
      provider: 'postgresql',
    }),
    baseURL: process.env.NEXT_PUBLIC_APP_URL,
    secret: process.env.SECRET_KEY!,
    socialProviders: {
      ...(authSettingsCache?.allowGoogleSignIn && {
        google: {
          enabled: true,
          clientId: authSettingsCache?.googleClientId ?? '',
          clientSecret: authSettingsCache?.googleClientSecret ?? '',
        },
      }),
      ...(authSettingsCache?.allowFacebookSignIn && {
        facebook: {
          enabled: true,
          clientId: authSettingsCache?.facebookClientId ?? '',
          clientSecret: authSettingsCache?.facebookClientSecret ?? '',
        },
      }),
    },
    user: {
      additionalFields: {
        customerId: {
          type: 'string',
        },
      },
    },
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 6,
      requireEmailVerification: authSettingsCache?.requireEmailVerification || false,
      sendResetPassword: async ({ url, user }) => {
        try {
          const { general } = await settingsService.getSettings(['general']);
          const template = resetPasswordTemplate({
            url,
            name: user.name,
            siteName: general?.siteTitle ?? '',
          });
          await mailService.sendMail({
            to: user.email,
            subject: template.subject,
            html: template.html,
          });
        } catch (error: any) {
          throw new APIError('BAD_REQUEST', {
            message: error.message || 'Failed to send reset password',
          });
        }
      },
      autoSignIn: true,
    },
    emailVerification: {
      sendVerificationEmail: async ({ url, user }) => {
        try {
          const { general } = await settingsService.getSettings(['general']);
          const template = emailVerificationTemplate({
            url,
            name: user.name,
            siteName: general?.siteTitle ?? '',
          });
          if (authSettingsCache?.requireEmailVerification) {
            await mailService.sendMail({
              to: user.email,
              subject: template.subject,
              html: template.html,
            });
          }
        } catch (error: any) {
          throw new APIError('BAD_REQUEST', {
            message: error.message || 'Failed to send verification email',
          });
        }
      },
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
    },
    plugins: [passkey(), admin()],
  };
};

// Create a function to get the auth instance with latest settings
export const getAuth = async () => {
  const config = await getAuthConfig();
  return betterAuth(config);
};

// For backward compatibility, create an initial auth instance
export const auth = betterAuth(await getAuthConfig());

export type User = BetterAuthUser & {
  role: 'admin' | 'user';
};
export type Session = {
  user: User;
  session: BetterAuthSession;
};

export const getSession = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session || !session.user) {
      return null;
    }
    return session as unknown as Session;
  } catch {
    return null;
  }
};
