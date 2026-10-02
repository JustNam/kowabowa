'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { ROUTES } from '@/constants/routes'

const links = [
  { href: ROUTES.DASHBOARD, label: 'Dashboard' },
  { href: ROUTES.GOALS.LIST, label: 'Goals' },
  { href: ROUTES.SKILLS.LIST, label: 'Skills' },
  { href: ROUTES.LOGS.LIST, label: 'Logs' },
]

// Self-hides when signed out, so it's safe to render unconditionally in
// layout.tsx above both authenticated pages and /login, /forgot-password.
export function NavBar() {
  const { user, signOut } = useAuth()
  const pathname = usePathname()

  if (!user) return null

  return (
    <nav className="border-b border-slate-200 px-6 py-3">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-semibold text-slate-900">Kowabowa</span>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                pathname.startsWith(link.href)
                  ? 'text-sm font-medium text-slate-900'
                  : 'text-sm text-slate-500 hover:text-slate-900'
              }
            >
              {link.label}
            </Link>
          ))}
        </div>
        <button
          type="button"
          onClick={() => signOut()}
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          Sign out
        </button>
      </div>
    </nav>
  )
}
