'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { Button } from '@/atoms/button'
import { Input } from '@/atoms/input'
import { ROUTES } from '@/constants/routes'

export default function LoginPage() {
  const router = useRouter()
  const { signIn, signUp, loading, error } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (mode === 'signin') {
      await signIn(email, password)
      router.push(ROUTES.POST_LOGIN_REDIRECT)
    } else {
      await signUp(email, password)
      setMode('signin')
    }
  }

  return (
    <div className="mx-auto mt-24 w-full max-w-sm px-6">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">
        {mode === 'signin' ? 'Sign in to Kowabowa' : 'Create your account'}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Sign up'}
        </Button>
      </form>

      {mode === 'signin' && (
        <Link
          href={ROUTES.FORGOT_PASSWORD}
          className="mt-4 block text-sm text-slate-500 underline"
        >
          Forgot password?
        </Link>
      )}

      <button
        type="button"
        onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
        className="mt-4 text-sm text-slate-500 underline"
      >
        {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
      </button>
    </div>
  )
}
