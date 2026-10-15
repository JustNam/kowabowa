'use client'

import { useState } from 'react'
import { CompetenciesApi } from '@/api/competencies'
import { Button } from '@/atoms/button'
import { Modal } from '@/atoms/modal'
import type { ICompetencyModel } from '@/interfaces/competency.model'

interface CompetenciesDeleteProps {
  skill: ICompetencyModel   
  onClose: () => void
  onDeleted: () => void
}

export function CompetenciesDelete({ skill, onClose, onDeleted }: CompetenciesDeleteProps) {
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleClose = () => {
    onClose()
  }

  const handleDelete = async () => {
    setSubmitting(true)
    setError(null)
    try {
      await CompetenciesApi.remove(skill.id)
      onDeleted()
      handleClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      if (message === 'Skill is used in logs') {
        setError('This skill is used in your logs, so it can’t be deleted.')
      } else {
        setError('Could not delete the skill. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open onClose={handleClose} title="Delete skill">
      <div className="flex flex-col gap-4 pt-1">
        <p className="text-sm">
          Delete <strong>{skill.title}</strong>? This can’t be undone.
        </p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={submitting}>
            {submitting ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
