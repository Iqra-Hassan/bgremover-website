import prisma from '@/lib/prisma';
import { SettingsKey, SettingsDataMap } from './setting-schema';
import { cache } from 'react';

const getSettings = async <const K extends readonly SettingsKey[]>(
  keys: K,
): Promise<{ [P in K[number]]: SettingsDataMap[P] | null }> => {
  // query all settings whose key is in the `keys` tuple
  const results = await prisma.setting.findMany({
    where: { key: { in: keys as unknown as string[] } },
  });

  // build up the result object with all keys initialized to null
  const settingsMap = {} as { [P in K[number]]: SettingsDataMap[P] | null };
  keys.forEach((key) => {
    (settingsMap as any)[key] = null;
  });

  // fill in any that we actually got back from the DB
  results.forEach((row) => {
    const k = row.key as K[number];
    settingsMap[k] = row.value as SettingsDataMap[typeof k];
  });

  return settingsMap;
};

const getSetting = async <K extends SettingsKey>(key: K): Promise<SettingsDataMap[K] | null> => {
  const result = await prisma.setting.findFirst({
    where: { key },
  });

  if (!result) {
    return null;
  }

  return result.value as SettingsDataMap[K];
};

const saveSettings = async <K extends SettingsKey>(key: K, body: SettingsDataMap[K]) => {
  await prisma.setting.upsert({
    where: { key },
    update: { value: body },
    create: { key, value: body },
  });
};

export const getPublicSettings = cache(async () => {
  try {
    const { general, auth, billing } = await getSettings(['general', 'auth', 'billing']);
    return {
      general: general,
      auth: {
        requireEmailVerification: auth?.requireEmailVerification ?? false,
        allowGoogleSignIn: auth?.allowGoogleSignIn ?? false,
        allowFacebookSignIn: auth?.allowFacebookSignIn ?? false,
      },
      billing: {
        provider: billing?.provider,
        currency: billing?.currency ?? 'USD',
      },
    };
  } catch {
    return null;
  }
});

export type PublicSettings = Awaited<ReturnType<typeof getPublicSettings>>;

export default {
  saveSettings,
  getSetting,
  getSettings,
};
