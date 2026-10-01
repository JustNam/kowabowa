import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { env } from '@/config/environment'

/**
 * Server-side Supabase client. Use inside Server Components,
 * Route Handlers (src/app/api/**), and middleware.
 */
export async function createClient() {
  const cookieStore = await cookies()
  const config = env.supabase

  return createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Called from a Server Component — safe to ignore because
          // middleware refreshes the session on every request.
        }
      },
    },
  })
}
