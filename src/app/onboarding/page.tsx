'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ValidationError } from 'yup'
import { GoalsApi } from '@/api/goals'
import { createGoalSchema } from '@/modules/goals/schema'
import { Button } from '@/atoms/button'
import { Input } from '@/atoms/input'
import { Textarea } from '@/atoms/textarea'
import { ROUTES } from '@/constants/routes'

// Shown once, right after signup — same fields/validation as the regular
// Create Goal modal (src/modules/goals/components/create), just as a
// full page instead of an overlay. Completing it is how a new user gets
// their first goal; see login/page.tsx for the redirect-on-signup wiring.
export default function OnboardingPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = title.trim() !== '' && startDate !== '' && endDate !== ''

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
      router.push(ROUTES.DASHBOARD)
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
    <div className="mx-auto mt-24 w-full max-w-sm px-6">
      <h1 className="mb-1 text-2xl font-semibold text-slate-900">Create your first goal</h1>
      <p className="mb-6 text-sm text-slate-500">
        You can always add more goals later — this just gets you started.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            placeholder="Enter goal name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
          </div>
          <div className="flex-1">
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
          </div>
        </div>

        <div>
          <Textarea
            placeholder="Describe your goal"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>

        {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

        <Button type="submit" disabled={!canSubmit || submitting} className="w-full">
          {submitting ? 'Creating…' : 'Create goal'}
        </Button>
      </form>
    </div>
  )
}
