import clsx from 'clsx'
import { forwardRef, type ButtonHTMLAttributes } from 'react'

/**
 * Atom: pure UI, no business logic. See ARCHITECTURE.md#atoms-vs-components.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={clsx(
        'inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
)
Button.displayName = 'Button'
