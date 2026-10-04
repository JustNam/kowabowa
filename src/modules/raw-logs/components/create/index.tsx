'use client'

import { Modal } from '@/atoms/modal'

interface RawLogsCreateProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
  /** Pre-fill and lock the goal when opened from a Goal detail page. */
  defaultGoalId?: string
}

// TODO: build the Log work form, rendered inside the Modal below.
// - Fields: goal picker (select among the user's goals), description
//   (what did you do?), and a competency/skill picker (one or more
//   skills demonstrated). Validate with `validateRawLogForm` from
//   '../../schema'.
// - On submit, call `RawLogsApi.create(values)` from '@/api/rawLogs',
//   then `onCreated()` and `onClose()`.
// - Reuse the Select/Textarea/Button atoms.
export function RawLogsCreate({ open, onClose }: RawLogsCreateProps) {
  return (
    <Modal open={open} onClose={onClose} title="Log work">
      {/* TODO: form fields + submit handler */}
      {null}
    </Modal>
  )
}
