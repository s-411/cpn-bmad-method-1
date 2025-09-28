'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface ShareContextType {
  state: {
    isShareModalOpen: boolean
    shareData: any
  }
  actions: {
    openShareModal: (data: any) => void
    closeShareModal: () => void
  }
}

const ShareContext = createContext<ShareContextType | undefined>(undefined)

export function ShareProvider({ children }: { children: ReactNode }) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [shareData, setShareData] = useState(null)

  const openShareModal = (data: any) => {
    setShareData(data)
    setIsShareModalOpen(true)
  }

  const closeShareModal = () => {
    setIsShareModalOpen(false)
    setShareData(null)
  }

  return (
    <ShareContext.Provider value={{
      state: {
        isShareModalOpen,
        shareData,
      },
      actions: {
        openShareModal,
        closeShareModal,
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