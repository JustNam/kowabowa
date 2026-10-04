'use client'

import { Modal } from '@/atoms/modal'

interface CompetenciesCreateProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

// TODO: build the Add Skill form, rendered inside the Modal below.
// - One field: name (required, keep it under 60 characters). Write a plain
//   validation function, e.g. `function validateName(name: string): string | null`.
// - On submit, call `CompetenciesApi.create({ name })` from
//   '@/api/competencies', then `onCreated()` and `onClose()`.
export function CompetenciesCreate({ open, onClose }: CompetenciesCreateProps) {
  return (
    <Modal open={open} onClose={onClose} title="Add skill">
      {/* TODO: form field + submit handler */}
      {null}
    </Modal>
  )
}
