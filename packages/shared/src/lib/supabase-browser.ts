import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '../types/database/database'

// Singleton instance
let supabaseBrowserInstance: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createSupabaseBrowser() {
  // Return existing instance if available
  if (supabaseBrowserInstance) {
    return supabaseBrowserInstance
  }

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables in browser client:', {
      url: !!supabaseUrl,
      key: !!supabaseAnonKey
    })

    // Return a mock client that doesn't crash
    return new Proxy({}, {
      get(target, prop) {
        console.warn(`Supabase browser client not available: attempted to access ${String(prop)}`)
        return () => Promise.reject(new Error('Supabase browser client not initialized'))
      }
    }) as any
  }

  // Project reference for cookie filtering
  const PROJECT_REF = 'elaecgbjbxwcgguhtomz'

  // Create new instance
  supabaseBrowserInstance = createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          // Browser environment check first
          if (typeof document === 'undefined') return undefined

          // Project-specific filtering
          if (!name.includes(PROJECT_REF)) {
            return undefined
          }

          return document.cookie
            .split('; ')
            .find(row => row.startsWith(`${name}=`))
            ?.split('=')[1]
        },
        set(name: string, value: string, options) {
          // Browser environment check first
          if (typeof document === 'undefined') return

          // Only set cookies for target project
          if (!name.includes(PROJECT_REF)) return

          let cookie = `${name}=${value}`
          if (options?.expires) cookie += `; expires=${options.expires.toUTCString()}`
          if (options?.path) cookie += `; path=${options.path}`
          if (options?.maxAge) cookie += `; max-age=${options.maxAge}`
          if (options?.domain) cookie += `; domain=${options.domain}`
          if (options?.secure) cookie += `; secure`
          if (options?.sameSite) cookie += `; samesite=${options.sameSite}`

          document.cookie = cookie
        },
        remove(name: string, options) {
          // Browser environment check first
          if (typeof document === 'undefined') return

          // Only remove cookies for target project
          if (!name.includes(PROJECT_REF)) return

          let cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC`
          if (options?.path) cookie += `; path=${options.path}`
          if (options?.domain) cookie += `; domain=${options.domain}`

          document.cookie = cookie
        }
      }
    }
  )

  return supabaseBrowserInstance
}