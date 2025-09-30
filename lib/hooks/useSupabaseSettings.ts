'use client';

import { useState, useEffect, useCallback } from 'react';
import { createSupabaseBrowser } from '@cpn/shared';
import { useAuth } from '@/lib/auth/AuthProvider';
import type {
  UserProfileSettings,
  DateTimeSettings,
  NotificationSettings,
  PrivacySettings
} from '@cpn/shared';

interface UseSupabaseSettingsReturn {
  profileSettings: UserProfileSettings | null;
  dateTimeSettings: DateTimeSettings | null;
  notificationSettings: NotificationSettings | null;
  privacySettings: PrivacySettings | null;
  loading: boolean;
  error: string | null;
  updateProfileSettings: (settings: Partial<UserProfileSettings>) => Promise<void>;
  updateDateTimeSettings: (settings: Partial<DateTimeSettings>) => Promise<void>;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const defaultProfileSettings: UserProfileSettings = {
  displayName: 'CPN User',
  avatarUrl: '👤',
  accountCreated: new Date('2024-01-01').toISOString(),
  lastLogin: new Date().toISOString()
};

const defaultDateTimeSettings: DateTimeSettings = {
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  weekStart: 'monday'
};

const defaultNotificationSettings: NotificationSettings = {
  leaderboardUpdates: true,
  achievementAlerts: true,
  weeklyReports: false,
  monthlyReports: true,
  dataReminders: true
};

const defaultPrivacySettings: PrivacySettings = {
  leaderboardVisible: true,
  shareStats: false,
  shareAchievements: true,
  profileDiscoverable: true,
  anonymousMode: false
};

export function useSupabaseSettings(): UseSupabaseSettingsReturn {
  const { user, loading: authLoading } = useAuth();
  const [profileSettings, setProfileSettings] = useState<UserProfileSettings | null>(null);
  const [dateTimeSettings, setDateTimeSettings] = useState<DateTimeSettings | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createSupabaseBrowser();

  // Load settings from Supabase with localStorage fallback
  const loadSettings = useCallback(async () => {
    if (!user) {
      // Load from localStorage if not authenticated
      try {
        const savedProfile = localStorage.getItem('cpn_user_profile');
        if (savedProfile) {
          const parsed = JSON.parse(savedProfile);
          setProfileSettings({
            ...defaultProfileSettings,
            ...parsed,
            accountCreated: parsed.accountCreated || defaultProfileSettings.accountCreated,
            lastLogin: parsed.lastLogin || defaultProfileSettings.lastLogin
          });
        } else {
          setProfileSettings(defaultProfileSettings);
        }

        const savedDateTime = localStorage.getItem('cpn_datetime_settings');
        setDateTimeSettings(savedDateTime ? JSON.parse(savedDateTime) : defaultDateTimeSettings);

        const savedNotifications = localStorage.getItem('cpn_notification_settings');
        setNotificationSettings(savedNotifications ? JSON.parse(savedNotifications) : defaultNotificationSettings);

        const savedPrivacy = localStorage.getItem('cpn_privacy_settings');
        setPrivacySettings(savedPrivacy ? JSON.parse(savedPrivacy) : defaultPrivacySettings);
      } catch (err) {
        console.error('Error loading settings from localStorage:', err);
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('users')
        .select('profile_settings, datetime_settings, notification_settings, privacy_settings')
        .eq('id', user.id)
        .single() as {
          data: {
            profile_settings: UserProfileSettings | null;
            datetime_settings: DateTimeSettings | null;
            notification_settings: NotificationSettings | null;
            privacy_settings: PrivacySettings | null;
          } | null;
          error: any;
        };

      if (fetchError) {
        console.error('Error fetching settings:', fetchError);
        setError(fetchError.message);

        // Fall back to localStorage
        loadLocalStorageSettings();
        return;
      }

      if (data) {
        // Load from Supabase, using defaults for any missing values
        setProfileSettings(data.profile_settings || defaultProfileSettings);
        setDateTimeSettings(data.datetime_settings || defaultDateTimeSettings);
        setNotificationSettings(data.notification_settings || defaultNotificationSettings);
        setPrivacySettings(data.privacy_settings || defaultPrivacySettings);

        // Migrate localStorage data to Supabase if settings are still defaults
        if (!data.profile_settings || !data.datetime_settings ||
            !data.notification_settings || !data.privacy_settings) {
          await migrateLocalStorageToSupabase();
        }
      }
    } catch (err) {
      console.error('Error in loadSettings:', err);
      setError('Failed to load settings');
      loadLocalStorageSettings();
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  // Helper function to load from localStorage
  const loadLocalStorageSettings = () => {
    try {
      const savedProfile = localStorage.getItem('cpn_user_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setProfileSettings({
          ...defaultProfileSettings,
          ...parsed,
          accountCreated: parsed.accountCreated || defaultProfileSettings.accountCreated,
          lastLogin: parsed.lastLogin || defaultProfileSettings.lastLogin
        });
      } else {
        setProfileSettings(defaultProfileSettings);
      }

      const savedDateTime = localStorage.getItem('cpn_datetime_settings');
      setDateTimeSettings(savedDateTime ? JSON.parse(savedDateTime) : defaultDateTimeSettings);

      const savedNotifications = localStorage.getItem('cpn_notification_settings');
      setNotificationSettings(savedNotifications ? JSON.parse(savedNotifications) : defaultNotificationSettings);

      const savedPrivacy = localStorage.getItem('cpn_privacy_settings');
      setPrivacySettings(savedPrivacy ? JSON.parse(savedPrivacy) : defaultPrivacySettings);
    } catch (err) {
      console.error('Error loading from localStorage:', err);
    }
  };

  // Migrate localStorage settings to Supabase
  const migrateLocalStorageToSupabase = async () => {
    if (!user) return;

    try {
      const localProfile = localStorage.getItem('cpn_user_profile');
      const localDateTime = localStorage.getItem('cpn_datetime_settings');
      const localNotifications = localStorage.getItem('cpn_notification_settings');
      const localPrivacy = localStorage.getItem('cpn_privacy_settings');

      const updates: any = {};

      if (localProfile) {
        const parsed = JSON.parse(localProfile);
        updates.profile_settings = {
          ...defaultProfileSettings,
          ...parsed,
          accountCreated: parsed.accountCreated || defaultProfileSettings.accountCreated,
          lastLogin: new Date().toISOString()
        };
      }

      if (localDateTime) {
        updates.datetime_settings = JSON.parse(localDateTime);
      }

      if (localNotifications) {
        updates.notification_settings = JSON.parse(localNotifications);
      }

      if (localPrivacy) {
        updates.privacy_settings = JSON.parse(localPrivacy);
      }

      if (Object.keys(updates).length > 0) {
        await (supabase as any)
          .from('users')
          .update(updates)
          .eq('id', user.id);
      }
    } catch (err) {
      console.error('Error migrating localStorage to Supabase:', err);
    }
  };

  // Update functions for each settings type
  const updateProfileSettings = async (settings: Partial<UserProfileSettings>) => {
    const newSettings = { ...(profileSettings || defaultProfileSettings), ...settings };
    setProfileSettings(newSettings);

    // Save to localStorage for offline access
    localStorage.setItem('cpn_user_profile', JSON.stringify(newSettings));

    if (user) {
      try {
        const { error: updateError } = await (supabase as any)
          .from('users')
          .update({ profile_settings: newSettings })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating profile settings:', updateError);
          setError(updateError.message);
        }
      } catch (err) {
        console.error('Error saving profile settings:', err);
        setError('Failed to save profile settings');
      }
    }
  };

  const updateDateTimeSettings = async (settings: Partial<DateTimeSettings>) => {
    const newSettings = { ...(dateTimeSettings || defaultDateTimeSettings), ...settings };
    setDateTimeSettings(newSettings);

    // Save to localStorage for offline access
    localStorage.setItem('cpn_datetime_settings', JSON.stringify(newSettings));

    if (user) {
      try {
        const { error: updateError } = await (supabase as any)
          .from('users')
          .update({ datetime_settings: newSettings })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating datetime settings:', updateError);
          setError(updateError.message);
        }
      } catch (err) {
        console.error('Error saving datetime settings:', err);
        setError('Failed to save datetime settings');
      }
    }
  };

  const updateNotificationSettings = async (settings: Partial<NotificationSettings>) => {
    const newSettings = { ...(notificationSettings || defaultNotificationSettings), ...settings };
    setNotificationSettings(newSettings);

    // Save to localStorage for offline access
    localStorage.setItem('cpn_notification_settings', JSON.stringify(newSettings));

    if (user) {
      try {
        const { error: updateError } = await (supabase as any)
          .from('users')
          .update({ notification_settings: newSettings })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating notification settings:', updateError);
          setError(updateError.message);
        }
      } catch (err) {
        console.error('Error saving notification settings:', err);
        setError('Failed to save notification settings');
      }
    }
  };

  const updatePrivacySettings = async (settings: Partial<PrivacySettings>) => {
    const newSettings = { ...(privacySettings || defaultPrivacySettings), ...settings };
    setPrivacySettings(newSettings);

    // Save to localStorage for offline access
    localStorage.setItem('cpn_privacy_settings', JSON.stringify(newSettings));

    if (user) {
      try {
        const { error: updateError } = await (supabase as any)
          .from('users')
          .update({ privacy_settings: newSettings })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating privacy settings:', updateError);
          setError(updateError.message);
        }
      } catch (err) {
        console.error('Error saving privacy settings:', err);
        setError('Failed to save privacy settings');
      }
    }
  };

  const refreshSettings = async () => {
    await loadSettings();
  };

  // Load settings on mount and when user changes
  useEffect(() => {
    if (!authLoading) {
      loadSettings();
    }
  }, [authLoading, loadSettings]);

  return {
    profileSettings,
    dateTimeSettings,
    notificationSettings,
    privacySettings,
    loading: loading || authLoading,
    error,
    updateProfileSettings,
    updateDateTimeSettings,
    updateNotificationSettings,
    updatePrivacySettings,
    refreshSettings
  };
}