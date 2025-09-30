'use client';

import { useState, useEffect, useCallback } from 'react';
import { createSupabaseBrowser } from '@cpn/shared';
import { useAuth } from '@/lib/auth/AuthProvider';
import type {
  LeaderboardGroup,
  LeaderboardMember,
  LeaderboardStats
} from '@cpn/shared';

interface UseSupabaseLeaderboardsReturn {
  groups: LeaderboardGroup[];
  currentGroup: LeaderboardGroup | null;
  members: LeaderboardMember[];
  loading: boolean;
  error: string | null;
  createGroup: (name: string, isPrivate?: boolean) => Promise<LeaderboardGroup | null>;
  joinGroup: (inviteToken: string) => Promise<boolean>;
  leaveGroup: (groupId: string) => Promise<boolean>;
  updateStats: (groupId: string, stats: Partial<LeaderboardStats>) => Promise<boolean>;
  refreshGroups: () => Promise<void>;
  refreshMembers: (groupId: string) => Promise<void>;
  setCurrentGroup: (group: LeaderboardGroup | null) => void;
}

export function useSupabaseLeaderboards(): UseSupabaseLeaderboardsReturn {
  const { user, loading: authLoading } = useAuth();
  const [groups, setGroups] = useState<LeaderboardGroup[]>([]);
  const [currentGroup, setCurrentGroupState] = useState<LeaderboardGroup | null>(null);
  const [members, setMembers] = useState<LeaderboardMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createSupabaseBrowser();

  // Load groups for the current user
  const loadGroups = useCallback(async () => {
    if (!user) {
      // Load from localStorage as fallback
      try {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('leaderboard-groups');
          if (stored) {
            const localGroups = JSON.parse(stored);
            setGroups(localGroups);
          }
        }
      } catch (err) {
        console.error('Error loading groups from localStorage:', err);
      }
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await (supabase as any)
        .from('leaderboard_groups')
        .select('*')
        .or(`user_id.eq.${user.id},created_by.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching groups:', fetchError);
        setError(fetchError.message);

        // Fall back to localStorage
        loadLocalStorageGroups();
        return;
      }

      setGroups(data || []);

      // Migrate localStorage groups if none exist in Supabase
      if ((!data || data.length === 0) && typeof window !== 'undefined') {
        await migrateLocalStorageGroups();
      }
    } catch (err) {
      console.error('Error in loadGroups:', err);
      setError('Failed to load groups');
      loadLocalStorageGroups();
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  // Load members for a specific group
  const loadMembers = useCallback(async (groupId: string) => {
    if (!user) {
      // Load from localStorage as fallback
      try {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem(`leaderboard-members-${groupId}`);
          if (stored) {
            const localMembers = JSON.parse(stored);
            setMembers(localMembers);
          }
        }
      } catch (err) {
        console.error('Error loading members from localStorage:', err);
      }
      return;
    }

    try {
      const { data, error: fetchError } = await (supabase as any)
        .from('leaderboard_members')
        .select('*')
        .eq('group_id', groupId)
        .order('joined_at', { ascending: true });

      if (fetchError) {
        console.error('Error fetching members:', fetchError);
        setError(fetchError.message);

        // Fall back to localStorage
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem(`leaderboard-members-${groupId}`);
          if (stored) {
            const localMembers = JSON.parse(stored);
            setMembers(localMembers);
          }
        }
        return;
      }

      setMembers(data || []);
    } catch (err) {
      console.error('Error in loadMembers:', err);
      setError('Failed to load members');
    }
  }, [user, supabase]);

  // Helper to load from localStorage
  const loadLocalStorageGroups = () => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('leaderboard-groups');
        if (stored) {
          const localGroups = JSON.parse(stored);
          setGroups(localGroups);
        }
      }
    } catch (err) {
      console.error('Error loading from localStorage:', err);
    }
  };

  // Migrate localStorage groups to Supabase
  const migrateLocalStorageGroups = async () => {
    if (!user || typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('leaderboard-groups');
      if (!stored) return;

      const localGroups = JSON.parse(stored);
      if (!Array.isArray(localGroups) || localGroups.length === 0) return;

      for (const localGroup of localGroups) {
        // Convert localStorage group to Supabase format
        const supabaseGroup = {
          name: localGroup.name,
          user_id: user.id,
          created_by: user.id,
          invite_token: localGroup.inviteToken || `invite-${Math.random().toString(36).substr(2, 9)}`,
          is_private: localGroup.isPrivate || false,
          member_count: localGroup.memberCount || 0
        };

        const { data: newGroup, error: insertError } = await (supabase as any)
          .from('leaderboard_groups')
          .insert([supabaseGroup])
          .select()
          .single();

        if (!insertError && newGroup) {
          // Migrate members for this group
          await migrateLocalStorageMembers(localGroup.id, newGroup.id);
        }
      }

      // Reload groups after migration
      await loadGroups();
    } catch (err) {
      console.error('Error migrating localStorage groups:', err);
    }
  };

  // Migrate localStorage members to Supabase
  const migrateLocalStorageMembers = async (localGroupId: string, supabaseGroupId: string) => {
    if (!user || typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(`leaderboard-members-${localGroupId}`);
      if (!stored) return;

      const localMembers = JSON.parse(stored);
      if (!Array.isArray(localMembers) || localMembers.length === 0) return;

      for (const localMember of localMembers) {
        const supabaseMember = {
          group_id: supabaseGroupId,
          user_id: user.id, // For demo purposes, assign all to current user
          username: localMember.username,
          stats: localMember.stats || { totalSpent: 0, totalNuts: 0, efficiency: 0 }
        };

        await (supabase as any)
          .from('leaderboard_members')
          .insert([supabaseMember]);
      }
    } catch (err) {
      console.error('Error migrating localStorage members:', err);
    }
  };

  // Create a new group
  const createGroup = async (name: string, isPrivate = false): Promise<LeaderboardGroup | null> => {
    if (!user) {
      // Create in localStorage for offline use
      const localGroup = {
        id: `group-${Date.now()}`,
        name,
        createdBy: 'offline-user',
        createdAt: new Date(),
        updatedAt: new Date(),
        inviteToken: `invite-${Math.random().toString(36).substr(2, 9)}`,
        isPrivate,
        memberCount: 0
      };

      try {
        const existingGroups = JSON.parse(localStorage.getItem('leaderboard-groups') || '[]');
        existingGroups.push(localGroup);
        localStorage.setItem('leaderboard-groups', JSON.stringify(existingGroups));
        await loadGroups();
        return localGroup as any;
      } catch (err) {
        console.error('Error creating group in localStorage:', err);
        return null;
      }
    }

    try {
      const newGroup = {
        name,
        user_id: user.id,
        created_by: user.id,
        invite_token: `invite-${Math.random().toString(36).substr(2, 9)}`,
        is_private: isPrivate,
        member_count: 0
      };

      const { data, error: insertError } = await (supabase as any)
        .from('leaderboard_groups')
        .insert([newGroup])
        .select()
        .single();

      if (insertError) {
        console.error('Error creating group:', insertError);
        setError(insertError.message);
        return null;
      }

      // Automatically join the user to their own group
      await joinGroup(data.invite_token);

      await loadGroups();
      return data;
    } catch (err) {
      console.error('Error in createGroup:', err);
      setError('Failed to create group');
      return null;
    }
  };

  // Join a group by invite token
  const joinGroup = async (inviteToken: string): Promise<boolean> => {
    if (!user) {
      setError('Must be logged in to join groups');
      return false;
    }

    try {
      // First, find the group by invite token
      const { data: group, error: findError } = await (supabase as any)
        .from('leaderboard_groups')
        .select('*')
        .eq('invite_token', inviteToken)
        .single();

      if (findError || !group) {
        setError('Invalid invite token');
        return false;
      }

      // Check if user is already a member
      const { data: existingMember } = await (supabase as any)
        .from('leaderboard_members')
        .select('id')
        .eq('group_id', group.id)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        setError('Already a member of this group');
        return false;
      }

      // Add user as a member
      const newMember = {
        group_id: group.id,
        user_id: user.id,
        username: user.email?.split('@')[0] || 'User', // Use email prefix as username
        stats: { totalSpent: 0, totalNuts: 0, efficiency: 0 }
      };

      const { error: insertError } = await (supabase as any)
        .from('leaderboard_members')
        .insert([newMember]);

      if (insertError) {
        console.error('Error joining group:', insertError);
        setError(insertError.message);
        return false;
      }

      // Update member count
      await (supabase as any)
        .from('leaderboard_groups')
        .update({
          member_count: group.member_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', group.id);

      await loadGroups();
      return true;
    } catch (err) {
      console.error('Error in joinGroup:', err);
      setError('Failed to join group');
      return false;
    }
  };

  // Leave a group
  const leaveGroup = async (groupId: string): Promise<boolean> => {
    if (!user) {
      return false;
    }

    try {
      const { error: deleteError } = await (supabase as any)
        .from('leaderboard_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Error leaving group:', deleteError);
        setError(deleteError.message);
        return false;
      }

      // Update member count
      const { data: group } = await (supabase as any)
        .from('leaderboard_groups')
        .select('member_count')
        .eq('id', groupId)
        .single();

      if (group) {
        await (supabase as any)
          .from('leaderboard_groups')
          .update({
            member_count: Math.max(0, group.member_count - 1),
            updated_at: new Date().toISOString()
          })
          .eq('id', groupId);
      }

      await loadGroups();
      if (currentGroup?.id === groupId) {
        setCurrentGroupState(null);
        setMembers([]);
      }
      return true;
    } catch (err) {
      console.error('Error in leaveGroup:', err);
      setError('Failed to leave group');
      return false;
    }
  };

  // Update user stats in a group
  const updateStats = async (groupId: string, stats: Partial<LeaderboardStats>): Promise<boolean> => {
    if (!user) {
      return false;
    }

    try {
      // Get current stats first
      const { data: currentMember } = await (supabase as any)
        .from('leaderboard_members')
        .select('stats')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single();

      if (!currentMember) {
        setError('Not a member of this group');
        return false;
      }

      const newStats = {
        ...currentMember.stats,
        ...stats
      };

      // Calculate efficiency
      if (newStats.totalNuts > 0) {
        newStats.efficiency = newStats.totalSpent / newStats.totalNuts;
      }

      const { error: updateError } = await (supabase as any)
        .from('leaderboard_members')
        .update({
          stats: newStats,
          updated_at: new Date().toISOString()
        })
        .eq('group_id', groupId)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating stats:', updateError);
        setError(updateError.message);
        return false;
      }

      // Refresh members if viewing this group
      if (currentGroup?.id === groupId) {
        await loadMembers(groupId);
      }

      return true;
    } catch (err) {
      console.error('Error in updateStats:', err);
      setError('Failed to update stats');
      return false;
    }
  };

  // Set current group and load its members
  const setCurrentGroup = (group: LeaderboardGroup | null) => {
    setCurrentGroupState(group);
    if (group) {
      loadMembers(group.id);
    } else {
      setMembers([]);
    }
  };

  // Refresh functions
  const refreshGroups = async () => {
    await loadGroups();
  };

  const refreshMembers = async (groupId: string) => {
    await loadMembers(groupId);
  };

  // Load groups on mount and when user changes
  useEffect(() => {
    if (!authLoading) {
      loadGroups();
    }
  }, [authLoading, loadGroups]);

  return {
    groups,
    currentGroup,
    members,
    loading: loading || authLoading,
    error,
    createGroup,
    joinGroup,
    leaveGroup,
    updateStats,
    refreshGroups,
    refreshMembers,
    setCurrentGroup
  };
}