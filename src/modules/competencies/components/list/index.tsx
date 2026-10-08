'use client'

import { useEffect, useState } from 'react'
import Chip from '@mui/material/Chip'
import { CompetenciesApi } from '@/api/competencies'
import { Button } from '@/atoms/button'
import type { ICompetencyModel } from '@/interfaces/competency.model'
import { CompetenciesCreate } from '../create'

export function CompetenciesList() {
  const [skills, setSkills] = useState<ICompetencyModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    CompetenciesApi.list()
      .then(({ data }) => {
        if (cancelled) return
        setSkills(data)
        setError(null)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load your skills.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>Add skill</Button>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading skills…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && skills.length === 0 && (
        <p className="text-sm text-gray-500">No skills yet. Add your first one.</p>
      )}

      {skills.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <li key={skill.id}>
              <Chip label={skill.name} />
            </li>
          ))}
        </ul>
      )}

      <CompetenciesCreate
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => setReloadKey((k) => k + 1)}
      />
    </div>
  )
}
