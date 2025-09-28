// Share types for build compatibility
// This will be implemented when sharing feature is developed

export interface ShareOptions {
  format: 'image' | 'text' | 'url'
  destination: 'clipboard' | 'download' | 'social'
  privacy: {
    level: 'public' | 'private' | 'unlisted'
    allowStatistics: boolean
    allowComparisons: boolean
    allowAchievements: boolean
  }
  platform?: 'instagram' | 'twitter' | 'facebook' | 'snapchat'
  dimensions?: {
    width: number
    height: number
  }
  watermark?: {
    enabled: boolean
    text?: string
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  }
}

export interface ShareResult {
  success: boolean
  url?: string
  error?: string
}

export interface ShareData {
  type: 'girl' | 'stats' | 'comparison'
  data: any
  options: ShareOptions
}

export interface ShareHistory {
  id: string
  timestamp: Date
  type: string
  title: string
  options: ShareOptions
  result: ShareResult
}