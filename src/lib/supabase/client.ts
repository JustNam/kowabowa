import { createBrowserClient } from '@supabase/ssr'
import { env } from '@/config/environment'

/**
 * Browser-side Supabase client. Use inside Client Components
 * (files starting with 'use client').
 *
 * NOTE: not generic over a `Database` type yet — generating typed
 * table definitions (`supabase gen types typescript`) is a natural
 * follow-up once you've designed more tables.
 */
export function createClient() {
  const config = env.supabase
  return createBrowserClient(config.url, config.anonKey)
}
