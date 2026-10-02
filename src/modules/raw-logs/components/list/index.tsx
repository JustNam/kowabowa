'use client'

import { useCallback, useEffect, useState } from 'react'
import { RawLogsApi } from '@/api/rawLogs'
import type { IRawLogModel } from '@/interfaces/raw-log.model'
import { Button } from '@/atoms/button'
import { RawLogsCreate } from '../create'

interface RawLogsListProps {
  /** Scopes the list to one goal and pre-fills the create modal — used
   * by the Goal detail page. Omit for the global /logs/list page. */
  goalId?: string
}

export function RawLogsList({ goalId }: RawLogsListProps = {}) {
  const [logs, setLogs] = useState<IRawLogModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const fetchLogs = useCallback(() => {
    setLoading(true)
    RawLogsApi.list(goalId)
      .then(({ data }) => setLogs(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load logs'))
      .finally(() => setLoading(false))
  }, [goalId])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  if (loading) return <p className="text-slate-500">Loading logs…</p>
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>Log work</Button>
      </div>

      {logs.length === 0 ? (
        <p className="text-slate-500">No logs yet. Log your first piece of work.</p>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-md border border-slate-200">
          {logs.map((log) => (
            <li key={log.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <p className="text-slate-900">{log.description}</p>
                <p className="shrink-0 text-sm text-slate-400">
                  {new Date(log.loggedAt).toLocaleDateString()}
                </p>
              </div>
              {!goalId && log.goalTitle && (
                <p className="mt-1 text-sm text-slate-500">Goal: {log.goalTitle}</p>
              )}
              {log.competencies.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {log.competencies.map((competency) => (
                    <span
                      key={competency.id}
                      className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                    >
                      {competency.name}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <RawLogsCreate
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={fetchLogs}
        defaultGoalId={goalId}
      />
    </div>
  )
}
