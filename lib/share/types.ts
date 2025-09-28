// Share types for build compatibility
// This will be implemented when sharing feature is developed

export interface ShareOptions {
  format: 'image' | 'text' | 'url'
  destination: 'clipboard' | 'download' | 'social'
  privacy: 'public' | 'private' | 'unlisted'
  platform?: 'instagram' | 'twitter' | 'facebook' | 'snapchat'
  dimensions?: {
    width: number
    height: number
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