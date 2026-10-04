'use client'

import { useState, type FormEvent } from 'react'
import { ValidationError } from 'yup'
import { GoalsApi } from '@/api/goals'
import { createGoalSchema } from '../../schema'
import { Modal } from '@/atoms/modal'
import { Button } from '@/atoms/button'
import { Input } from '@/atoms/input'
import { Textarea } from '@/atoms/textarea'

interface GoalsCreateProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function GoalsCreate({ open, onClose, onCreated }: GoalsCreateProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  function reset() {
    setTitle('')
    setDescription('')
    setStartDate('')
    setEndDate('')
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
      const values = await createGoalSchema.validate(
        { title, description, startDate, endDate },
        { abortEarly: false }
      )
      setSubmitting(true)
      await GoalsApi.create(values)
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
        setErrors({ form: err instanceof Error ? err.message : 'Failed to create goal' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="New goal">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            placeholder="Goal title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        </div>

        <div>
          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
          </div>
          <div className="flex-1">
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
          </div>
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
            {submitting ? 'Saving…' : 'Create goal'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
