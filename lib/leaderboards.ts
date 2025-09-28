// Placeholder leaderboards functionality for build compatibility
// This will be implemented when leaderboards feature is developed

export interface LeaderboardGroup {
  id: string
  name: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
  inviteToken: string
  isPrivate: boolean
  memberCount: number
}

export interface LeaderboardMember {
  id: string
  groupId: string
  userId: string
  username: string
  joinedAt: Date
  stats: any
}

export function useLeaderboards() {
  return {
    groups: [],
    currentGroup: null,
    loading: false,
    error: null,
    createGroup: async () => null,
    joinGroup: async () => null,
    leaveGroup: async () => null,
    updateStats: async () => null,
  }
}

// Storage utilities for leaderboards
export const leaderboardGroupsStorage = {
  getAll: (): LeaderboardGroup[] => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem('leaderboard-groups')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  },

  save: (groups: LeaderboardGroup[]) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('leaderboard-groups', JSON.stringify(groups))
    } catch {
      // Handle storage errors silently
    }
  },

  add: (group: LeaderboardGroup) => {
    const groups = leaderboardGroupsStorage.getAll()
    groups.push(group)
    leaderboardGroupsStorage.save(groups)
  },

  remove: (groupId: string) => {
    const groups = leaderboardGroupsStorage.getAll().filter(g => g.id !== groupId)
    leaderboardGroupsStorage.save(groups)
  },

  getByInviteToken: (token: string): LeaderboardGroup | null => {
    const groups = leaderboardGroupsStorage.getAll()
    return groups.find(g => g.inviteToken === token) || null
  }
}

export const leaderboardMembersStorage = {
  getByGroup: (groupId: string): LeaderboardMember[] => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(`leaderboard-members-${groupId}`)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  },

  save: (groupId: string, members: LeaderboardMember[]) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(`leaderboard-members-${groupId}`, JSON.stringify(members))
    } catch {
      // Handle storage errors silently
    }
  },

  add: (member: LeaderboardMember) => {
    const members = leaderboardMembersStorage.getByGroup(member.groupId)
    members.push(member)
    leaderboardMembersStorage.save(member.groupId, members)
  },

  remove: (groupId: string, memberId: string) => {
    const members = leaderboardMembersStorage.getByGroup(groupId).filter(m => m.id !== memberId)
    leaderboardMembersStorage.save(groupId, members)
  }
}

export function calculateRankings(members: LeaderboardMember[]) {
  return members
    .map(member => ({
      ...member,
      rank: 1,
      totalSpent: member.stats?.totalSpent || 0,
      totalNuts: member.stats?.totalNuts || 0,
      efficiency: member.stats?.totalNuts > 0 ? (member.stats.totalSpent / member.stats.totalNuts) : 0
    }))
    .sort((a, b) => a.efficiency - b.efficiency) // Lower cost per nut is better
    .map((member, index) => ({
      ...member,
      rank: index + 1
    }))
}

export function initializeSampleGroups() {
  // Initialize with sample data if no groups exist
  const existingGroups = leaderboardGroupsStorage.getAll()

  if (existingGroups.length === 0) {
    const sampleGroup: LeaderboardGroup = {
      id: 'sample-group-1',
      name: 'Sample Leaderboard',
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      inviteToken: 'sample-token-123',
      isPrivate: false,
      memberCount: 0
    }

    leaderboardGroupsStorage.add(sampleGroup)
  }

  return leaderboardGroupsStorage.getAll()
}