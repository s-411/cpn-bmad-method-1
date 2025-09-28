'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { AuthProvider } from './auth/AuthProvider'

interface AppContextType {
  // Add global app state here as needed
  theme: 'dark' | 'light'
  setTheme: (theme: 'dark' | 'light') => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

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