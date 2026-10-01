'use client'

import { useEffect, useState } from 'react'
import { GoalsApi } from '@/api/goals'
import type { IGoalModel } from '@/interfaces/goal.model'

export function GoalsDetail({ id }: { id: string }) {
  const [goal, setGoal] = useState<IGoalModel | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    GoalsApi.detail(id)
      .then(({ data }) => setGoal(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load goal'))
  }, [id])

  if (error) return <p className="text-red-600">{error}</p>
  if (!goal) return <p className="text-slate-500">Loading…</p>

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold text-slate-900">{goal.title}</h2>
      <p className="text-sm uppercase tracking-wide text-slate-400">
        {goal.status.replace('_', ' ')}
      </p>
      {goal.description && <p className="text-slate-700">{goal.description}</p>}
      {goal.targetDate && (
        <p className="text-sm text-slate-500">Target date: {goal.targetDate}</p>
      )}
    </div>
  )
}
