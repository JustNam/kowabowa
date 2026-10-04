'use client'

// TODO: build the Sign in / Sign up page.
// - Pull `signIn`, `signUp`, `loading`, `error` from `useAuth()`
//   ('@/components/AuthProvider').
// - Local state: a 'signin' | 'signup' mode toggle, email, password.
// - On submit, call signIn or signUp depending on mode:
//   - after signIn, redirect to ROUTES.POST_LOGIN_REDIRECT
//   - after signUp, redirect to ROUTES.ONBOARDING (new users land there
//     first — see src/app/onboarding/page.tsx)
// - Link to ROUTES.FORGOT_PASSWORD in sign-in mode, plus a toggle between
//   sign-in/sign-up copy. ROUTES from '@/constants/routes'.
// - Reuse the Input/Button atoms ('@/atoms/input', '@/atoms/button').
export default function LoginPage() {
  return null
}
