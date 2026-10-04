'use client'

// TODO: build the Forgot Password page.
// - Local state: email, submitted, loading, error.
// - On submit, call `createClient().auth.resetPasswordForEmail(email)`
//   from '@/lib/supabase/client' — one of the few places the app calls
//   Supabase directly instead of going through an API class, since it
//   doesn't establish a session (no cookies for a route handler to set).
// - Show a "check your email" message after a successful submit, an
//   error message on failure, and a link back to ROUTES.LOGIN
//   ('@/constants/routes').
// - Reuse the Input/Button atoms ('@/atoms/input', '@/atoms/button').
export default function ForgotPasswordPage() {
  return null
}
