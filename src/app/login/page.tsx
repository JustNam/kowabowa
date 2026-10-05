'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { Input } from '@/atoms/input'
import { Button } from '@/atoms/button'
import { ROUTES } from '@/constants/routes'

type Mode = 'signin' | 'signup'

export default function LoginPage() {
  const router = useRouter()
  const { signIn, signUp, loading, error } = useAuth()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      if (mode === 'signin') {
        await signIn(email, password)
        router.push(ROUTES.POST_LOGIN_REDIRECT)
      } else {
        await signUp(email, password)
        router.push(ROUTES.ONBOARDING)
      }
    } catch {
      // error is already surfaced via useAuth()'s `error` state
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          {mode === 'signin' ? 'Sign in' : 'Create your account'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {mode === 'signin'
            ? 'Welcome back to Kowabowa.'
            : 'Start tracking your work toward your next review.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {mode === 'signin' && (
            <Link href={ROUTES.FORGOT_PASSWORD} className="self-end text-sm text-slate-500 hover:text-slate-700">
              Forgot password?
            </Link>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" disabled={loading}>
            {mode === 'signin' ? 'Sign in' : 'Sign up'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="font-medium text-slate-900 hover:underline"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
