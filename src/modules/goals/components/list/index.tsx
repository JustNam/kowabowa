'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { GoalsApi } from '@/api/goals'
import type { IGoalModel } from '@/interfaces/goal.model'
import { Button } from '@/atoms/button'
import { ROUTES } from '@/constants/routes'
import { GoalsCreate } from '../create'

export function GoalsList() {
  const [goals, setGoals] = useState<IGoalModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const fetchGoals = useCallback(() => {
    setLoading(true)
    GoalsApi.list()
      .then(({ data }) => setGoals(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load goals'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  if (loading) return <p className="text-slate-500">Loading goals…</p>
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>New goal</Button>
      </div>

      {goals.length === 0 ? (
        <p className="text-slate-500">No goals yet. Create your first one.</p>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-md border border-slate-200">
          {goals.map((goal) => (
            <li key={goal.id} className="hover:bg-slate-50">
              <Link href={ROUTES.GOALS.DETAIL(goal.id)} className="block p-4">
                <p className="font-medium text-slate-900">{goal.title}</p>
                <p className="text-sm text-slate-500">{goal.status.replace('_', ' ')}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <GoalsCreate
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={fetchGoals}
      />
    </div>
  )
}
