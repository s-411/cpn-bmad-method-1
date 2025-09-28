// Placeholder referral tracking hook for build compatibility
// This will be implemented when referral system is developed

export function useReferralTracking() {
  return {
    referralCode: null,
    loading: false,
    error: null,
    generateReferralCode: async () => null,
    trackReferral: async () => null,
    getReferralStats: async () => null,
  }
}