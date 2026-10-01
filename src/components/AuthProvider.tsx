'use client'

import React, { createContext, useContext, type ReactNode } from 'react'
import { useAuth as useAuthHook } from '@/hooks/useAuth'
import type { IAuthState, IAuthActions } from '@/interfaces/auth.model'

interface AuthContextType extends IAuthState, IAuthActions {}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthHook()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
