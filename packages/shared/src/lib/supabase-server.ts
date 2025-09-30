import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '../types/database/database'

export async function createSupabaseServer() {
  const cookieStore = await cookies()
  // Project reference for cookie filtering
  const PROJECT_REF = 'elaecgbjbxwcgguhtomz'

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // ONLY return cookies for target project
          if (!name.includes(PROJECT_REF)) {
            return undefined
          }
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Only set cookies for target project
          if (!name.includes(PROJECT_REF)) return

          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Server Component cannot set cookies
          }
        },
        remove(name: string, options: CookieOptions) {
          // Only remove cookies for target project
          if (!name.includes(PROJECT_REF)) return

          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Server Component cannot remove cookies
          }
        },
      },
    }
  )
}

export async function createSupabaseServerAdmin() {
  const cookieStore = await cookies()
  // Project reference for cookie filtering
  const PROJECT_REF = 'elaecgbjbxwcgguhtomz'

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          // ONLY return cookies for target project
          if (!name.includes(PROJECT_REF)) {
            return undefined
          }
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Only set cookies for target project
          if (!name.includes(PROJECT_REF)) return

          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Server Component cannot set cookies
          }
        },
        remove(name: string, options: CookieOptions) {
          // Only remove cookies for target project
          if (!name.includes(PROJECT_REF)) return

          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Server Component cannot remove cookies
          }
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    }
  )
}