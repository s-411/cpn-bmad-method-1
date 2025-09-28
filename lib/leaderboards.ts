// Placeholder leaderboards functionality for build compatibility
// This will be implemented when leaderboards feature is developed

import { LeaderboardRanking } from './types'

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
  },

  getById: (id: string): LeaderboardGroup | null => {
    const groups = leaderboardGroupsStorage.getAll()
    return groups.find(g => g.id === id) || null
  },

  create: (name: string, isPrivate: boolean = false): LeaderboardGroup => {
    const group: LeaderboardGroup = {
      id: `group-${Date.now()}`,
      name,
      createdBy: 'current-user', // In real app, this would be actual user ID
      createdAt: new Date(),
      updatedAt: new Date(),
      inviteToken: `invite-${Math.random().toString(36).substr(2, 9)}`,
      isPrivate,
      memberCount: 0
    }
    leaderboardGroupsStorage.add(group)
    return group
  },

  delete: (groupId: string) => {
    leaderboardGroupsStorage.remove(groupId)
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
  },

  addMember: (groupId: string, userId: string, username: string) => {
    const member: LeaderboardMember = {
      id: `member-${Date.now()}`,
      groupId,
      userId,
      username,
      joinedAt: new Date(),
      stats: {
        totalSpent: 0,
        totalNuts: 0,
        efficiency: 0
      }
    }
    leaderboardMembersStorage.add(member)
  },

  addMockMember: (groupId: string) => {
    const mockNames = ['Player1', 'Player2', 'Player3', 'TopScorer', 'Rookie']
    const randomName = mockNames[Math.floor(Math.random() * mockNames.length)]
    const member: LeaderboardMember = {
      id: `mock-${Date.now()}`,
      groupId,
      userId: `mock-user-${Date.now()}`,
      username: `${randomName}${Math.floor(Math.random() * 1000)}`,
      joinedAt: new Date(),
      stats: {
        totalSpent: Math.floor(Math.random() * 1000) + 100,
        totalNuts: Math.floor(Math.random() * 50) + 10,
        efficiency: 0
      }
    }
    // Calculate efficiency
    member.stats.efficiency = member.stats.totalSpent / member.stats.totalNuts
    leaderboardMembersStorage.add(member)
  }
}

export function calculateRankings(members: LeaderboardMember[]): LeaderboardRanking[] {
  return members
    .map(member => ({
      member,
      rank: 1,
      efficiency: member.stats?.totalNuts > 0 ? (member.stats.totalSpent / member.stats.totalNuts) : 0
    }))
    .sort((a, b) => a.efficiency - b.efficiency) // Lower cost per nut is better
    .map((item, index) => ({
      rank: index + 1,
      member: item.member,
      change: 0 // Default change value
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