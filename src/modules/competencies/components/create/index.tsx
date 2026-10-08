'use client'

import { useState, type FormEvent } from 'react'
import { CompetenciesApi } from '@/api/competencies'
import { Button } from '@/atoms/button'
import { Input } from '@/atoms/input'
import { Modal } from '@/atoms/modal'
import { validateName } from '../../schema'

interface CompetenciesCreateProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function CompetenciesCreate({ open, onClose, onCreated }: CompetenciesCreateProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleClose = () => {
    setName('')
    setError(null)
    onClose()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const validationError = validateName(name)
    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await CompetenciesApi.create({ name: name.trim() })
      onCreated()
      handleClose()
    } catch {
      setError('Could not add the skill. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Add skill">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 pt-1">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={Boolean(error)}
          helperText={error}
          autoFocus
          required
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Adding…' : 'Add skill'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
