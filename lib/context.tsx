'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { AuthProvider } from './auth/AuthProvider'
import { errorLogger } from './utils/errorLogger'
import './utils/testErrorLogger' // Initialize test functions

// Re-export Supabase hooks with expected names
export { useSupabaseGirls as useGirls } from './hooks/useSupabaseGirls'
export { useSupabaseDataEntries as useDataEntries } from './hooks/useSupabaseDataEntries'
export { useSupabaseGlobalStats as useGlobalStats } from './hooks/useSupabaseGlobalStats'

// Export user profile hook
export { useUserProfile } from './hooks/useUserProfile'

interface AppContextType {
  // Add global app state here as needed
  theme: 'dark' | 'light'
  setTheme: (theme: 'dark' | 'light') => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  // Initialize error logger
  useEffect(() => {
    // Error logger initializes automatically, this just ensures it's loaded
    errorLogger.logError({
      type: 'info',
      category: 'System',
      message: 'Error logging system initialized',
      severity: 'low',
      emoji: '🚀',
      explanation: 'Comprehensive error logging is now active and monitoring the application.'
    })
  }, [])

  return (
    <AppContext.Provider value={{ theme, setTheme }}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}