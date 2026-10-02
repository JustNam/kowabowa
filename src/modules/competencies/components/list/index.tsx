'use client'

import { useCallback, useEffect, useState } from 'react'
import { CompetenciesApi } from '@/api/competencies'
import type { ICompetencyModel } from '@/interfaces/competency.model'
import { Button } from '@/atoms/button'
import { CompetenciesCreate } from '../create'

export function CompetenciesList() {
  const [competencies, setCompetencies] = useState<ICompetencyModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const fetchCompetencies = useCallback(() => {
    setLoading(true)
    CompetenciesApi.list()
      .then(({ data }) => setCompetencies(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load skills'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchCompetencies()
  }, [fetchCompetencies])

  if (loading) return <p className="text-slate-500">Loading skills…</p>
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>Add skill</Button>
      </div>

      {competencies.length === 0 ? (
        <p className="text-slate-500">No skills yet. Add the first one you're tracking.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {competencies.map((competency) => (
            <li
              key={competency.id}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700"
            >
              {competency.name}
            </li>
          ))}
        </ul>
      )}

      <CompetenciesCreate
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={fetchCompetencies}
      />
    </div>
  )
}
