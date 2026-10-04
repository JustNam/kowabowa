'use client'

import { Modal } from '@/atoms/modal'

interface GoalsCreateProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

// TODO: build the Create Goal form, rendered inside the Modal below.
// - Fields: title, description (optional), startDate, endDate. Validate
//   with `validateGoalForm` from '../../schema' (already requires
//   title, startDate, endDate, and end >= start).
// - On submit, call `GoalsApi.create(values)` from '@/api/goals', then
//   `onCreated()` and `onClose()`.
// - Reuse the Input/Textarea/Button atoms.
export function GoalsCreate({ open, onClose }: GoalsCreateProps) {
  return (
    <Modal open={open} onClose={onClose} title="New goal">
      {/* TODO: form fields + submit handler */}
      {null}
    </Modal>
  )
}
