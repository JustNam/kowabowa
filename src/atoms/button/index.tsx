import MuiButton, { type ButtonProps as MuiButtonProps } from '@mui/material/Button'
import { forwardRef } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'text' | 'destructive'

export interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'color'> {
  /** Maps onto MUI's own `variant`/`color` combination — see VARIANT_MAP below. */
  variant?: ButtonVariant
}

const VARIANT_MAP: Record<ButtonVariant, Pick<MuiButtonProps, 'variant' | 'color'>> = {
  primary: { variant: 'contained', color: 'primary' },
  secondary: { variant: 'outlined', color: 'primary' },
  ghost: { variant: 'text', color: 'primary' },
  text: { variant: 'text', color: 'primary' },
  destructive: { variant: 'contained', color: 'error' },
}

/**
 * Atom: pure UI, no business logic. See ARCHITECTURE.md#styling.
 * Thin wrapper over MUI's `Button`, themed via `src/lib/mui/theme.ts`.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', ...props }, ref) => {
    const { variant: muiVariant, color } = VARIANT_MAP[variant]
    return <MuiButton ref={ref} variant={muiVariant} color={color} {...props} />
  }
)
Button.displayName = 'Button'
