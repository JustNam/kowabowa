import MuiTextField, { type TextFieldProps } from '@mui/material/TextField'
import { forwardRef } from 'react'

export type SelectProps = Omit<TextFieldProps, 'select' | 'multiline'>

/**
 * Atom: pure UI, no business logic. See ARCHITECTURE.md#styling.
 * Thin wrapper over MUI's `TextField` in `select` mode, themed via
 * `src/lib/mui/theme.ts`. Children are `MenuItem`s (from `@mui/material`),
 * not native `<option>` elements.
 */
export const Select = forwardRef<HTMLInputElement, SelectProps>((props, ref) => (
  <MuiTextField select fullWidth size="small" inputRef={ref} {...props} />
))
Select.displayName = 'Select'
