'use client'

import { useState, type FormEvent } from 'react'
import { CompetenciesApi } from '@/api/competencies'
import { Modal } from '@/atoms/modal'
import { Button } from '@/atoms/button'
import { Input } from '@/atoms/input'

interface CompetenciesCreateProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

function validateName(name: string): string | null {
  const trimmed = name.trim()
  if (!trimmed) return 'Name is required'
  if (trimmed.length > 60) return 'Keep it under 60 characters'
  return null
}

export function CompetenciesCreate({ open, onClose, onCreated }: CompetenciesCreateProps) {
  const [name, setName] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  function reset() {
    setName('')
    setErrors({})
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setErrors({})

    const nameError = validateName(name)
    if (nameError) {
      setErrors({ name: nameError })
      return
    }

    try {
      setSubmitting(true)
      await CompetenciesApi.create({ name: name.trim() })
      reset()
      onCreated()
      onClose()
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Failed to add skill' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Add skill">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input placeholder="Skill name" value={name} onChange={(e) => setName(e.target.value)} />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            onClick={handleClose}
            className="bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Add skill'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
