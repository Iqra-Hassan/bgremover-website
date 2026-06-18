import { ContactStatus, PaymentStatus, PlanStatus, PostStatus, StorageType } from '@prisma/client';

export const FREE_USER_HISTORY_EXPIRATION_DAYS = 1;
export const PAID_USER_HISTORY_EXPIRATION_DAYS = 30;

export const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

export const queryKeys = {
  sessions: 'user-sessions',
  passkeys: 'user-passkeys',
  subscription: 'user-subscription',
  credits: 'user-credits',
  history: 'user-edit-history',
  transactions: 'user-transactions',
  expiredEdits: 'expired-edits',
  settings: {
    general: 'general',
    storage: 'storage',
    auth: 'auth',
    billing: 'billing',
    mail: 'mail',
    ai: 'ai',
    legal: 'legal',
    advanced: 'advanced',
  },
  admin: {
    media: 'media',
    plans: 'plans',
    users: 'users',
    posts: 'posts',
    contacts: 'contacts',
    payments: 'payments',
    stats: 'stats',
  },
} as const;

export const getPlanStatusLabel = (status: PlanStatus) => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'inactive':
      return 'Inactive';
    default:
      return status;
  }
};

export const getStorageProviderLabel = (provider: StorageType) => {
  switch (provider) {
    case 'local':
      return 'Local';
    case 's3':
      return 'S3';
    default:
      return provider;
  }
};

export const billingProviders = ['stripe', 'paypal'] as const;
export type BillingProvider = (typeof billingProviders)[number];

export const getBillingProviderLabel = (provider?: (typeof billingProviders)[number]) => {
  if (!provider) return 'Billing Provider';
  switch (provider) {
    case 'stripe':
      return 'Stripe';
    case 'paypal':
      return 'Paypal';
    default:
      return provider;
  }
};

export const paypalModes = ['sandbox', 'live'] as const;
export type PaypalMode = (typeof paypalModes)[number];

export const getPaypalModeLabel = (mode?: (typeof paypalModes)[number]) => {
  if (!mode) return 'Paypal Mode';
  switch (mode) {
    case 'sandbox':
      return 'Sandbox';
    case 'live':
      return 'Live';
    default:
      return mode;
  }
};

export const userRoles = ['user', 'admin'] as const;
export type UserRole = (typeof userRoles)[number];

export const getUserRoleLabel = (role: (typeof userRoles)[number]) => {
  switch (role) {
    case 'user':
      return 'User';
    case 'admin':
      return 'Admin';
    default:
      return role;
  }
};

export const getPostStatusLabel = (status: PostStatus) => {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'published':
      return 'Published';
    default:
      return status;
  }
};

export const getContactStatusLabel = (status: ContactStatus) => {
  switch (status) {
    case 'unread':
      return 'Unread';
    case 'read':
      return 'Read';
    case 'replied':
      return 'Replied';
    default:
      return status;
  }
};

export const aiModels = ['fluxKontextDev', 'fluxKontextPro', 'fluxKontextMax'] as const;
export type AiModel = (typeof aiModels)[number];

export const getPaymentStatusLabel = (status: PaymentStatus) => {
  switch (status) {
    case 'unpaid':
      return 'Unpaid';
    case 'paid':
      return 'Paid';
  }
};
