'use client'

import { useState, type FormEvent } from 'react'
import { CompetenciesApi } from '@/api/competencies'
import { Button } from '@/atoms/button'
import { Input } from '@/atoms/input'
import { Modal } from '@/atoms/modal'
import { validateTitle } from '../../schema'
import { Textarea } from '@/atoms/textarea'

interface CompetenciesCreateProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function CompetenciesCreate({ open, onClose, onCreated }: CompetenciesCreateProps) {
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [description, setDescription] = useState('')

  const handleClose = () => {
    setTitle('')
    setDescription('')
    setError(null)
    onClose()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const validationError = validateTitle(title)
    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await CompetenciesApi.create({ 
        title: title.trim(),
        description: description.trim() || undefined, 
      })
      onCreated()
      handleClose()
    } catch {
      setError('Could not add the skill. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const saveDisabled = submitting || !title.trim ()

  return (
    <Modal open={open} onClose={handleClose} title="Add skill">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 pt-1">
        <div className="flex flex-col gap-1">
        <label htmlFor="skill-title" className="text-sm font-semibold">
          Skill <span className="text-red-600">*</span>
        </label>
        <Input
          value={title}
          id="skill-title"
          placeholder="Enter the skill name"
          onChange={(e) => setTitle(e.target.value)}
          error={Boolean(error)}
          helperText={error}
          autoFocus
          required
        />
        </div>
        <div className="flex flex-col gap-1">
        <label htmlFor="skill-description" className="text-sm font-semibold">
          Description
        </label>
        <Textarea
          id="skill-description"
          placeholder="Describe this skill"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
        </div>
        <div className="-mx-6 flex justify-end gap-2 border-t border-gray-200 px-6 pt-4">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={saveDisabled}>
            {submitting ? 'Adding…' : 'Add skill'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
