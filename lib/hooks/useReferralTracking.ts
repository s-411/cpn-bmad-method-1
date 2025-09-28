// Placeholder referral tracking hook for build compatibility
// This will be implemented when referral system is developed

export function useReferralTracking() {
  return {
    referralCode: null,
    referralId: null,
    affiliateCode: null,
    loading: false,
    error: null,
    generateReferralCode: async () => null,
    trackReferral: async () => null,
    trackConversion: async () => null,
    trackEvent: async () => null,
    getReferralStats: async () => null,
  }
}