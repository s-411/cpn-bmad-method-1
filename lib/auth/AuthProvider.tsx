'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js'
import { createSupabaseBrowser } from '@cpn/shared'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseBrowser()

  const createUserIfNotExists = async (user: User) => {
    if (!user.email) return

    try {
      await (supabase as any).rpc('create_user_if_not_exists', { user_email: user.email })
    } catch (error) {
      console.error('Error creating user record:', error)
    }
  }

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user ?? null
      setUser(user)

      // Create user record if authenticated
      if (user) {
        await createUserIfNotExists(user)
      }

      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        const user = session?.user ?? null
        setUser(user)

        // Create user record if authenticated
        if (user && event === 'SIGNED_IN') {
          await createUserIfNotExists(user)
        }

        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      // Force immediate redirect to login after sign out
      window.location.href = '/auth/login'
    } catch (error) {
      console.error('Sign out error:', error)
      // Even if sign out fails, redirect to login
      window.location.href = '/auth/login'
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}