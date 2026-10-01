import axios from 'axios'
import { createClient } from '@/lib/supabase/client'
import { env } from '@/config/environment'

/**
 * Axios instance for calling kowabowa-backend's Edge Functions — a
 * SEPARATE repo/deployable from this app, reached cross-origin. Unlike
 * `src/lib/axios.ts` (same-origin, cookie-based, for our own /api/auth/*
 * routes only), every request here needs an explicit Bearer token because
 * Edge Functions don't see this app's cookies.
 */
export const backendApi = axios.create({
  baseURL: env.api.functionsUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Extract the access token from the Supabase auth cookie as a fallback
// when createClient().auth.getSession() returns null. This happens right
// after sign-in: our own /api/auth/signin route sets the session cookie
// server-side, but the browser client singleton may not have picked it
// up yet on the very next request.
function getAccessTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null
  try {
    const cookie = document.cookie.split(';').find((c) => c.trim().match(/^sb-.*-auth-token=/))
    if (!cookie) return null

    let value = cookie.split('=').slice(1).join('=').trim()
    if (value.startsWith('base64-')) {
      value = atob(value.substring('base64-'.length).replace(/-/g, '+').replace(/_/g, '/'))
    }
    const session = JSON.parse(value)
    return session?.access_token || null
  } catch {
    return null
  }
}

backendApi.interceptors.request.use(async (config) => {
  if (typeof window === 'undefined') return config

  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const token = session?.access_token || getAccessTokenFromCookie()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

backendApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Request failed'
    return Promise.reject(new Error(message))
  }
)

export default backendApi
