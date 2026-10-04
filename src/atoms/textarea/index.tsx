import MuiTextField, { type TextFieldProps } from '@mui/material/TextField'
import { forwardRef } from 'react'

export type TextareaProps = Omit<TextFieldProps, 'multiline' | 'select'>

/**
 * Atom: pure UI, no business logic. See ARCHITECTURE.md#styling.
 * Thin wrapper over MUI's `TextField` (multiline), themed via
 * `src/lib/mui/theme.ts`.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ rows = 3, ...props }, ref) => (
    <MuiTextField inputRef={ref} fullWidth multiline rows={rows} size="small" {...props} />
  )
)
Textarea.displayName = 'Textarea'
