'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/atoms/button'
import { Input } from '@/atoms/input'
import { ROUTES } from '@/constants/routes'

// Calls Supabase Auth directly (like useAuth.ts does) rather than going
// through src/app/api/auth/* — this doesn't establish a session or set
// cookies, it just asks Supabase to send an email, so there's no
// server-side cookie work for a route handler to do.
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email)

    setLoading(false)
    if (resetError) {
      setError(resetError.message)
      return
    }
    setSubmitted(true)
  }

  return (
    <div className="mx-auto mt-24 w-full max-w-sm px-6">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Forgot password</h1>

      {submitted ? (
        <p className="text-slate-600">
          Check your email — we sent a link to reset your password to {email}.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
      )}

      <Link href={ROUTES.LOGIN} className="mt-4 inline-block text-sm text-slate-500 underline">
        Back to sign in
      </Link>
    </div>
  )
}
