'use client'

import {
  DatePicker as MuiDatePicker,
  type DatePickerProps as MuiDatePickerProps,
} from '@mui/x-date-pickers/DatePicker'

export type DatePickerProps = MuiDatePickerProps

/**
 * Atom: pure UI, no business logic. See ARCHITECTURE.md#styling.
 * Thin wrapper over MUI X's `DatePicker`. Relies on the `LocalizationProvider`
 * registered once, globally, in `src/lib/mui/ThemeRegistry.tsx` — no need to
 * wrap individual usages in a provider.
 */
export function DatePicker(props: DatePickerProps) {
  return <MuiDatePicker {...props} />
}
