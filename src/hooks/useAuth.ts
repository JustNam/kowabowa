'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AuthApi } from '@/api/auth'
import type { IAuthState, IAuthActions, IUserModel } from '@/interfaces/auth.model'

/**
 * Holds the actual auth logic. Not meant to be imported directly by pages —
 * import `useAuth` from `@/components/AuthProvider` instead, which exposes
 * this same state/actions through React Context so every component under
 * <AuthProvider> shares one subscription instead of each mounting its own.
 */
export function useAuth(): IAuthState & IAuthActions {
  const [user, setUser] = useState<IUserModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await AuthApi.signIn(email, password)
      setUser(data.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      await AuthApi.signUp(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    await AuthApi.signOut()
    setUser(null)
  }, [])

  return { user, loading, error, signIn, signUp, signOut }
}
