import clsx from 'clsx'
import { forwardRef, type TextareaHTMLAttributes } from 'react'

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={clsx(
      'w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none',
      className
    )}
    {...props}
  />
))
Textarea.displayName = 'Textarea'
