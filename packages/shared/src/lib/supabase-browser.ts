import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '../types/database/database'

// Singleton instance
let supabaseBrowserInstance: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createSupabaseBrowser() {
  // Return existing instance if available
  if (supabaseBrowserInstance) {
    return supabaseBrowserInstance
  }

  // Project reference for cookie filtering
  const PROJECT_REF = 'elaecgbjbxwcgguhtomz'

  // Create new instance
  supabaseBrowserInstance = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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