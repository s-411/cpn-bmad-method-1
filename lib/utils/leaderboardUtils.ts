import type { LeaderboardMember } from '@cpn/shared';

export interface LeaderboardRanking {
  rank: number;
  member: LeaderboardMember;
  change: number;
}

export function calculateRankings(members: LeaderboardMember[]): LeaderboardRanking[] {
  return members
    .map(member => ({
      member,
      rank: 1,
      efficiency: member.stats?.totalNuts > 0 ? (member.stats.totalSpent / member.stats.totalNuts) : Infinity
    }))
    .sort((a, b) => {
      // Lower cost per nut is better (more efficient)
      if (a.efficiency === Infinity && b.efficiency === Infinity) return 0;
      if (a.efficiency === Infinity) return 1;
      if (b.efficiency === Infinity) return -1;
      return a.efficiency - b.efficiency;
    })
    .map((item, index) => ({
      rank: index + 1,
      member: item.member,
      change: 0 // TODO: Implement change tracking by comparing with previous rankings
    }));
}

export function formatEfficiency(efficiency: number): string {
  if (efficiency === Infinity || efficiency === 0) {
    return 'N/A';
  }
  return `$${efficiency.toFixed(2)}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

export function generateInviteToken(): string {
  return `invite-${Math.random().toString(36).substr(2, 9)}`;
}

export function getMockLeaderboardStats() {
  const totalSpent = Math.floor(Math.random() * 1000) + 100;
  const totalNuts = Math.floor(Math.random() * 50) + 10;
  const totalGirls = Math.floor(Math.random() * 20) + 5;
  const totalTime = Math.floor(Math.random() * 500) + 100;
  const costPerNut = totalSpent / totalNuts;

  return {
    totalSpent,
    totalNuts,
    costPerNut,
    totalTime,
    totalGirls,
    efficiency: Math.floor(Math.random() * 100) + 1 // Will be calculated based on ranking
  };
}

export function addMockMember(groupId: string, existingMembers: LeaderboardMember[] = []): Omit<LeaderboardMember, 'id' | 'created_at' | 'updated_at'> {
  const mockNames = ['CostEfficient', 'BigSpender', 'Optimizer', 'ValueHunter', 'BudgetKing', 'EfficiencyMaster'];
  const usedNames = existingMembers.map(m => m.username.replace(/\d+$/, ''));
  const availableNames = mockNames.filter(name => !usedNames.includes(name));
  const selectedName = availableNames.length > 0 ? availableNames[0] : mockNames[0];

  const stats = getMockLeaderboardStats();

  return {
    group_id: groupId,
    user_id: `mock-user-${Date.now()}-${Math.random()}`,
    username: `${selectedName}${Math.floor(Math.random() * 100)}`,
    stats,
    joined_at: new Date().toISOString()
  };
}