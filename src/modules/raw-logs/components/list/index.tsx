'use client'

import { useState, useEffect } from 'react'
import type { IRawLogModel } from '@/interfaces/raw-log.model'
import { RawLogsApi } from '@/api/rawLogs'
import { format, parseISO, isSameYear } from 'date-fns'
import { Button } from '@/atoms/button'
import { RawLogsCreate } from '../create'
import { groupLogsByPeriod } from '../../groupLogs'

interface RawLogsListProps {
  /** Scopes the list to one goal and pre-fills the create modal — the
   * only current caller is the Goal detail page. */
  goalId?: string
  onChanged?: () => void
}

interface TabButtonProps {
  active: boolean
  label: string
  count: number
  onClick: () => void
}

// TODO: build the Raw logs list.
// - Fetch logs on mount with `RawLogsApi.list(goalId?)` ('@/api/rawLogs');
//   hold them in local state along with loading/error flags.
// - Render each log in a list (description, logged date, linked goal,
//   competencies/skills demonstrated).
// - A "Log work" button that opens the Create log modal — import
//   `RawLogsCreate` from '../create', manage its open/closed state here,
//   and pass it an `onCreated` callback that refetches the list.
export function RawLogsList({ goalId, onChanged }: RawLogsListProps = {}) {
  const [logs, setLogs] = useState<IRawLogModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<'logs' | 'achievements'>('logs')
  const [createOpen, setCreateOpen] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    RawLogsApi.list(goalId)
      .then(({ data }) => {
        setLogs(data)
        setError(null)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [goalId, reloadKey])

  const achievements = logs.filter((log) => log.isAchievement)
  const groups = groupLogsByPeriod(logs)

  if (loading) return <p className="text-sm text-gray-500">Loading logs...</p>
  if (error) return <p className="text-sm text-red-600">{error}</p>

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-6 border-b border-gray-200">
        <TabButton
          active={tab === 'logs'}
          label="Logs"
          count={logs.length}
          onClick={() => setTab('logs')}
        />
        <TabButton
          active={tab === 'achievements'}
          label="Achievements"
          count={achievements.length}
          onClick={() => setTab('achievements')}
        />
      </div>
      {tab === 'logs' ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Log your work as you go. You can mark any log as an achievement later.
          </p>
          <Button onClick={() => setCreateOpen(true)}>Add log</Button>
        </div>
      ) : (
        <p className="text-sm text-gray-600">
          Logs you marked as real results. Remove one to turn it back into a normal log.
        </p>
      )}

      {tab === 'logs' ? (
        <div className="flex flex-col">
          {groups.map((group) => (
            <section key={group.key} className="border-t border-gray-200 py-3">
              <header className="flex items-center justify-between text-sm">
                <h3 className="font-semibold">
                  {group.label}
                  {group.range && (
                    <span className="ml-2 font-normal text-gray-500">· {group.range}</span>
                  )}
                </h3>
                <span className="text-gray-500">
                  {group.logs.length} {group.logs.length === 1 ? 'log' : 'logs'}
                </span>
              </header>
              <ul className="mt-3 flex flex-col gap-3">
                {group.logs.map((log) => (
                  <LogItem
                    key={log.id}
                    log={log}
                    dateLabel={formatLogDate(log.loggedAt, group.key)}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {achievements.map((log) => (
            <LogItem
              key={log.id}
              log={log}
              dateLabel={format(parseISO(log.loggedAt), 'dd MMM yyyy')}
            />
          ))}
        </ul>
      )}

      <RawLogsCreate
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setReloadKey((k) => k + 1)
          onChanged?.()
        }}
        defaultGoalId={goalId}
      />
    </div>
  )
}

function TabButton({ active, label, count, onClick }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px flex items-center gap-2 border-b-2 px-1 pb-3 text-sm ${
        active
          ? 'border-gray-700 font-semibold text-gray-900'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      {label}
      <span
        className={`rounded-full px-2 py-0.5 text-xs ${
          active ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-600'
        }`}
      >
        {count}
      </span>
    </button>
  )
}

interface LogItemProps {
  log: IRawLogModel
  dateLabel: string
}

const formatLogDate = (loggedAt: string, groupKey: string) => {
  const date = parseISO(loggedAt)
  if (groupKey !== 'upcoming') return format(date, 'EEE d')
  return format(date, isSameYear(date, new Date()) ? 'd MMM' : 'd MMM yyyy')
}

function LogItem({ log, dateLabel }: LogItemProps) {
  return (
    <li className="rounded-lg border border-gray-200 p-3">
      <p className="text-xs text-gray-500">{dateLabel}</p>
      <p className="font-medium">{log.title}</p>
      {log.description && <p className="text-sm text-gray-600">{log.description}</p>}
      {log.skillTitle && <span className="text-xs">{log.skillTitle}</span>}
      {log.isAchievement && <span className="text-xs">Achievement</span>}
    </li>
  )
}
