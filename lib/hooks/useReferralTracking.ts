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
    trackConversion: async (email: string, amount: number, plan: string) => null,
    trackEvent: async (eventName: string, data?: any) => null,
    getReferralStats: async () => null,
  }
}