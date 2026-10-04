'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { useAuth } from '@/components/AuthProvider'
import { ROUTES } from '@/constants/routes'
import { RawLogsCreate } from '@/modules/raw-logs/components/create'

const links = [
  { href: ROUTES.DASHBOARD, label: 'Dashboard' },
  { href: ROUTES.GOALS.LIST, label: 'Goals' },
  { href: ROUTES.SKILLS.LIST, label: 'Skills' },
]

/**
 * Collapsible left sidebar per the design doc — logo links to Dashboard,
 * exactly Dashboard/Goals/Skills, a standalone Quick log button (opens
 * the same RawLogsCreate modal Goal detail uses, just without a
 * pre-filled goal), and an avatar. Collapsed state shows icon-only
 * (first letter) with a native `title` tooltip instead of pulling in an
 * icon/tooltip library.
 *
 * Self-hides when signed out, so it's safe to render unconditionally in
 * layout.tsx above both authenticated pages and /login, /forgot-password.
 */
export function Sidebar() {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [quickLogOpen, setQuickLogOpen] = useState(false)

  if (!user) return null

  const initial = (user.email ?? '?')[0]!.toUpperCase()

  return (
    <>
      <aside
        className={clsx(
          'flex h-screen shrink-0 flex-col justify-between border-r border-slate-200 py-4 transition-[width]',
          collapsed ? 'w-16' : 'w-56'
        )}
      >
        <div>
          <div className={clsx('flex items-center gap-2 px-4', collapsed && 'justify-center px-0')}>
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="text-slate-400 hover:text-slate-900"
            >
              ☰
            </button>
            {!collapsed && (
              <Link href={ROUTES.DASHBOARD} className="font-semibold text-slate-900">
                Kowabowa
              </Link>
            )}
          </div>

          <nav className="mt-6 space-y-1 px-2">
            {links.map((link) => {
              const active = pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  title={collapsed ? link.label : undefined}
                  className={clsx(
                    'flex items-center rounded-md px-2 py-2 text-sm',
                    collapsed ? 'justify-center' : 'gap-3',
                    active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center text-xs font-semibold">
                    {link.label[0]}
                  </span>
                  {!collapsed && link.label}
                </Link>
              )
            })}
          </nav>

          <div className="mt-6 px-2">
            <button
              type="button"
              onClick={() => setQuickLogOpen(true)}
              title={collapsed ? 'Quick log' : undefined}
              className={clsx(
                'flex w-full items-center rounded-md bg-slate-900 px-2 py-2 text-sm font-medium text-white hover:bg-slate-700',
                collapsed ? 'justify-center' : 'gap-3'
              )}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center text-xs">+</span>
              {!collapsed && 'Quick log'}
            </button>
          </div>
        </div>

        <div
          className={clsx(
            'flex items-center gap-2 px-4',
            collapsed && 'flex-col gap-3 px-0'
          )}
        >
          <span
            title={user.email ?? undefined}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700"
          >
            {initial}
          </span>
          <button
            type="button"
            onClick={() => signOut()}
            title={collapsed ? 'Sign out' : undefined}
            className="text-sm text-slate-500 hover:text-slate-900"
          >
            {collapsed ? '⏻' : 'Sign out'}
          </button>
        </div>
      </aside>

      <RawLogsCreate
        open={quickLogOpen}
        onClose={() => setQuickLogOpen(false)}
        onCreated={() => {}}
      />
    </>
  )
}
