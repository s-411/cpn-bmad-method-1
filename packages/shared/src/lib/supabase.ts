import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey,
    env: process.env.NODE_ENV
  })

  // In development, throw immediately
  if (process.env.NODE_ENV === 'development') {
    throw new Error('Missing Supabase environment variables')
  }

  // In production, log error but don't crash immediately
  console.error('Supabase client initialization will fail - check environment variables')
}

// Create Supabase client with error handling
export const supabase = (() => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing environment variables')
    }

    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'x-application-name': 'cpn-app',
        },
      },
    })
  } catch (error) {
    console.error('Failed to create Supabase client:', error)

    // Return a mock client that logs warnings
    return new Proxy({}, {
      get(target, prop) {
        console.warn(`Supabase client not available: attempted to access ${String(prop)}`)
        return () => Promise.reject(new Error('Supabase client not initialized'))
      }
    }) as any
  }
})()

export type SupabaseClient = typeof supabase

// Helper function to check if Supabase is available
export const isSupabaseAvailable = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}