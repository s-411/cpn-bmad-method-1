// Subscription tier constants and feature access
export const SUBSCRIPTION_TIERS = {
  BOYFRIEND: 'boyfriend',
  PLAYER: 'player',
  LIFETIME: 'lifetime'
} as const;

export type SubscriptionTier = typeof SUBSCRIPTION_TIERS[keyof typeof SUBSCRIPTION_TIERS];

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired'
} as const;

export type SubscriptionStatus = typeof SUBSCRIPTION_STATUS[keyof typeof SUBSCRIPTION_STATUS];

// Feature access matrix
export const FEATURE_ACCESS = {
  [SUBSCRIPTION_TIERS.BOYFRIEND]: {
    girls_profiles: true,
    data_entry: true,
    basic_metrics: true,
    overview_dashboard: true,
    analytics_dashboard: false,
    custom_sharing: false,
    advanced_features: false,
    max_girls: 3, // Optional limit for free tier
  },
  [SUBSCRIPTION_TIERS.PLAYER]: {
    girls_profiles: true,
    data_entry: true,
    basic_metrics: true,
    overview_dashboard: true,
    analytics_dashboard: true,
    custom_sharing: true,
    advanced_features: false,
    max_girls: null, // Unlimited
  },
  [SUBSCRIPTION_TIERS.LIFETIME]: {
    girls_profiles: true,
    data_entry: true,
    basic_metrics: true,
    overview_dashboard: true,
    analytics_dashboard: true,
    custom_sharing: true,
    advanced_features: true,
    max_girls: null, // Unlimited
  }
} as const;

// Pricing information (in cents for Stripe)
export const SUBSCRIPTION_PRICES = {
  [SUBSCRIPTION_TIERS.BOYFRIEND]: {
    amount: 0,
    currency: 'usd',
    interval: null,
    display_price: 'Free'
  },
  [SUBSCRIPTION_TIERS.PLAYER]: {
    amount: 199, // $1.99
    currency: 'usd',
    interval: 'week',
    display_price: '$1.99/week'
  },
  [SUBSCRIPTION_TIERS.LIFETIME]: {
    amount: 2700, // $27.00
    currency: 'usd',
    interval: null,
    display_price: '$27 one-time'
  }
} as const;

// Helper function to check feature access
export function hasFeatureAccess(
  tier: SubscriptionTier | undefined,
  status: SubscriptionStatus | undefined,
  feature: keyof typeof FEATURE_ACCESS[typeof SUBSCRIPTION_TIERS.BOYFRIEND]
): boolean {
  if (!tier || !status) return false;
  if (status !== SUBSCRIPTION_STATUS.ACTIVE) return false;

  return Boolean(FEATURE_ACCESS[tier]?.[feature]) ?? false;
}

// Helper function to check if user can add more girls
export function canAddMoreGirls(
  tier: SubscriptionTier | undefined,
  status: SubscriptionStatus | undefined,
  currentCount: number
): boolean {
  if (!tier || !status) return false;
  if (status !== SUBSCRIPTION_STATUS.ACTIVE) return false;

  const maxGirls = FEATURE_ACCESS[tier]?.max_girls;
  return maxGirls === null || currentCount < maxGirls;
}