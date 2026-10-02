'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { ValidationError } from 'yup'
import { RawLogsApi } from '@/api/rawLogs'
import { GoalsApi } from '@/api/goals'
import { CompetenciesApi } from '@/api/competencies'
import { createRawLogSchema } from '../../schema'
import { Modal } from '@/atoms/modal'
import { Button } from '@/atoms/button'
import { Textarea } from '@/atoms/textarea'
import { Select } from '@/atoms/select'
import type { IGoalModel } from '@/interfaces/goal.model'
import type { ICompetencyModel } from '@/interfaces/competency.model'

interface RawLogsCreateProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
  /** Pre-fill and lock the goal when opened from a Goal detail page. */
  defaultGoalId?: string
}

export function RawLogsCreate({ open, onClose, onCreated, defaultGoalId }: RawLogsCreateProps) {
  const [goals, setGoals] = useState<IGoalModel[]>([])
  const [competencies, setCompetencies] = useState<ICompetencyModel[]>([])
  const [goalId, setGoalId] = useState(defaultGoalId ?? '')
  const [description, setDescription] = useState('')
  const [competencyIds, setCompetencyIds] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    GoalsApi.list().then(({ data }) => setGoals(data))
    CompetenciesApi.list().then(({ data }) => setCompetencies(data))
  }, [open])

  useEffect(() => {
    if (defaultGoalId) setGoalId(defaultGoalId)
  }, [defaultGoalId])

  function reset() {
    setDescription('')
    setCompetencyIds([])
    setErrors({})
    if (!defaultGoalId) setGoalId('')
  }

  function handleClose() {
    reset()
    onClose()
  }

  function toggleCompetency(id: string) {
    setCompetencyIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setErrors({})

    try {
      const values = await createRawLogSchema.validate(
        { goalId, description, competencyIds },
        { abortEarly: false }
      )
      setSubmitting(true)
      await RawLogsApi.create(values)
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
        setErrors({ form: err instanceof Error ? err.message : 'Failed to add log' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Log work">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Select
            value={goalId}
            onChange={(e) => setGoalId(e.target.value)}
            disabled={!!defaultGoalId}
          >
            <option value="">Select a goal…</option>
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.title}
              </option>
            ))}
          </Select>
          {errors.goalId && <p className="mt-1 text-sm text-red-600">{errors.goalId}</p>}
        </div>

        <div>
          <Textarea
            placeholder="What did you do?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Skills demonstrated</p>
          {competencies.length === 0 ? (
            <p className="text-sm text-slate-500">
              No skills yet — add one on the Skills page first.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {competencies.map((competency) => (
                <label
                  key={competency.id}
                  className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-700 has-[:checked]:border-slate-900 has-[:checked]:bg-slate-900 has-[:checked]:text-white"
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={competencyIds.includes(competency.id)}
                    onChange={() => toggleCompetency(competency.id)}
                  />
                  {competency.name}
                </label>
              ))}
            </div>
          )}
          {errors.competencyIds && (
            <p className="mt-1 text-sm text-red-600">{errors.competencyIds}</p>
          )}
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
            {submitting ? 'Saving…' : 'Log it'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
