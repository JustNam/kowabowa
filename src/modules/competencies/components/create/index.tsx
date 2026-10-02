'use client'

import { useState, type FormEvent } from 'react'
import { ValidationError } from 'yup'
import { CompetenciesApi } from '@/api/competencies'
import { createCompetencySchema } from '../../schema'
import { Modal } from '@/atoms/modal'
import { Button } from '@/atoms/button'
import { Input } from '@/atoms/input'

interface CompetenciesCreateProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
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

    try {
      const values = await createCompetencySchema.validate({ name }, { abortEarly: false })
      setSubmitting(true)
      await CompetenciesApi.create(values)
      reset()
      onCreated()
      onClose()
    } catch (err) {
      if (err instanceof ValidationError) {
        const fieldErrors: Record<string, string> = {}
        err.inner.forEach((issue) => {
          if (issue.path) fieldErrors[issue.path] = issue.message
        })
        setErrors(fieldErrors)
      } else {
        setErrors({ form: err instanceof Error ? err.message : 'Failed to add skill' })
      }
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
