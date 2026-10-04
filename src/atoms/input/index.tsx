import MuiTextField, { type TextFieldProps } from '@mui/material/TextField'
import { forwardRef } from 'react'

export type InputProps = Omit<TextFieldProps, 'multiline' | 'select'>

/**
 * Atom: pure UI, no business logic. See ARCHITECTURE.md#styling.
 * Thin wrapper over MUI's `TextField`, themed via `src/lib/mui/theme.ts`.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => (
  <MuiTextField inputRef={ref} fullWidth size="small" {...props} />
))
Input.displayName = 'Input'
