'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface ShareContextType {
  isShareModalOpen: boolean
  shareData: any
  openShareModal: (data: any) => void
  closeShareModal: () => void
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
      isShareModalOpen,
      shareData,
      openShareModal,
      closeShareModal,
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