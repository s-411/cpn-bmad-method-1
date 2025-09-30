// Leaderboards functionality using Supabase
// Migrated from localStorage to Supabase for proper multi-user support

import { useSupabaseLeaderboards } from './hooks/useSupabaseLeaderboards'
import type { LeaderboardGroup as SupabaseLeaderboardGroup, LeaderboardMember as SupabaseLeaderboardMember } from '@cpn/shared'

// Re-export Supabase types for backward compatibility
export type LeaderboardGroup = SupabaseLeaderboardGroup
export type LeaderboardMember = SupabaseLeaderboardMember

// Main hook - now uses Supabase
export function useLeaderboards() {
  return useSupabaseLeaderboards()
}

// All leaderboard functionality now uses Supabase hooks
// Legacy localStorage storage removed as per migration guide