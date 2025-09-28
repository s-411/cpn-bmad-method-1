'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface ShareContextType {
  state: {
    isShareModalOpen: boolean
    shareData: any
    preferences: {
      defaultFormat: 'image' | 'text' | 'url'
      defaultPrivacy: {
        level: 'public' | 'private' | 'unlisted'
        allowStatistics: boolean
        allowComparisons: boolean
        allowAchievements: boolean
      }
      autoWatermark: boolean
    }
    history: any[]
  }
  actions: {
    openShareModal: (data: any) => void
    closeShareModal: () => void
    generateStatCard: (data: any, options: any) => void
    generateComparisonReport: (data: any, options: any) => void
    toggleHistoryPanel: (open: boolean) => void
  }
}

const ShareContext = createContext<ShareContextType | undefined>(undefined)

export function ShareProvider({ children }: { children: ReactNode }) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [shareData, setShareData] = useState(null)
  const [preferences] = useState({
    defaultFormat: 'image' as const,
    defaultPrivacy: {
      level: 'public' as const,
      allowStatistics: true,
      allowComparisons: true,
      allowAchievements: true,
    },
    autoWatermark: true,
  })
  const [history] = useState<any[]>([])

  const openShareModal = (data: any) => {
    setShareData(data)
    setIsShareModalOpen(true)
  }

  const closeShareModal = () => {
    setIsShareModalOpen(false)
    setShareData(null)
  }

  const generateStatCard = (data: any, options: any) => {
    // Placeholder implementation for stat card generation
    console.log('Generating stat card:', data, options)
  }

  const generateComparisonReport = (data: any, options: any) => {
    // Placeholder implementation for comparison report generation
    console.log('Generating comparison report:', data, options)
  }

  const toggleHistoryPanel = (open: boolean) => {
    // Placeholder implementation for history panel toggle
    console.log('Toggle history panel:', open)
  }

  return (
    <ShareContext.Provider value={{
      state: {
        isShareModalOpen,
        shareData,
        preferences,
        history,
      },
      actions: {
        openShareModal,
        closeShareModal,
        generateStatCard,
        generateComparisonReport,
        toggleHistoryPanel,
      },
    }}>
      {children}
    </ShareContext.Provider>
  )
}

export function useShare() {
  const context = useContext(ShareContext)
  if (context === undefined) {
    throw new Error('useShare must be used within a ShareProvider')
  }
  return context
}