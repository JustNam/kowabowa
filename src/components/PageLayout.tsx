import type { ReactNode } from 'react'

interface PageLayoutProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}

/**
 * Standard page shell for every feature page. Keeps spacing/typography
 * consistent without reaching for a component library.
 */
export function PageLayout({ title, subtitle, actions, children }: PageLayoutProps) {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </div>
  )
}
