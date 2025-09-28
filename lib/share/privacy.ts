// Privacy settings for sharing functionality
// This will be implemented when sharing feature is developed

export interface PrivacySettings {
  defaultPrivacy: 'public' | 'private' | 'unlisted'
  allowPublicSharing: boolean
  watermarkEnabled: boolean
  analyticsEnabled: boolean
}

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  defaultPrivacy: 'public',
  allowPublicSharing: true,
  watermarkEnabled: true,
  analyticsEnabled: false,
}

export function validatePrivacyLevel(level: string): boolean {
  return ['public', 'private', 'unlisted'].includes(level)
}

export function getPrivacyDescription(level: string): string {
  switch (level) {
    case 'public':
      return 'Visible to everyone'
    case 'private':
      return 'Only visible to you'
    case 'unlisted':
      return 'Accessible via link only'
    default:
      return 'Unknown privacy level'
  }
}