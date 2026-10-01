import { redirect } from 'next/navigation'
import { ROUTES } from '@/constants/routes'

// middleware.ts already redirects '/' based on auth state before this
// component ever renders in practice. This is just the required fallback
// Next.js expects for the root route to be valid.
export default function RootPage() {
  redirect(ROUTES.LOGIN)
}
