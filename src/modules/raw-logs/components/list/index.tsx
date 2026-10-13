'use client'

import { Chip } from '@mui/material'
import { Check, KeyboardArrowDown, KeyboardArrowRight } from '@mui/icons-material'
import { Button } from '@/atoms/button'
import { useState, useEffect } from 'react'
import type { IRawLogModel } from '@/interfaces/raw-log.model'
import { RawLogsApi } from '@/api/rawLogs'
import { format, parseISO, isSameYear } from 'date-fns'
import { RawLogsCreate } from '../create'
import { groupLogsByPeriod } from '../../groupLogs'
import { AchievementItem } from '../achievement-item'

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

const OPEN_BY_DEFAULT = ['upcoming', 'this-week', 'last-week']

export function RawLogsList({ goalId, onChanged }: RawLogsListProps = {}) {
  const [logs, setLogs] = useState<IRawLogModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<'logs' | 'achievements'>('logs')
  const [createOpen, setCreateOpen] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [openOverrides, setOpenOverrides] = useState<Record<string, boolean>>({})
  const [toggleId, setToggleId] = useState<string | null>(null)
  const [toggleError, setToggleError] = useState<string | null>(null)

  useEffect(() => {
    RawLogsApi.list(goalId)
      .then(({ data }) => {
        setLogs(data)
        setError(null)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [goalId, reloadKey])

  const handleToggleAchievement = async (log: IRawLogModel) => {
    setToggleId(log.id)
    setToggleError(null)
    try {
      await RawLogsApi.setAchievement(log.id, !log.isAchievement)
      setReloadKey((k) => k + 1)
      onChanged?.()
    } catch (err) {
      setToggleError(err instanceof Error ? err.message : 'Could not update the log')
    } finally {
      setToggleId(null)
    }
  }

  const achievements = logs.filter((log) => log.isAchievement)
  const groups = groupLogsByPeriod(logs)

  const isOpen = (key: string) => openOverrides[key] ?? OPEN_BY_DEFAULT.includes(key)
  const toggleGroup = (key: string) =>
    setOpenOverrides((prev) => ({ ...prev, [key]: !isOpen(key) }))

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
      {toggleError && <p className="text-sm text-red-600">{toggleError}</p>}
      {tab === 'logs' ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Log your work as you go. You can mark any log as an achievement later.
          </p>
          <Button onClick={() => setCreateOpen(true)}>Add log</Button>
        </div>
      ) : (
        <p className="text-sm text-gray-600">Logs you marked as real results.</p>
      )}

      {tab === 'logs' ? (
        <div className="flex flex-col">
          {groups.map((group) => {
            const open = isOpen(group.key)
            const achievementCount = group.logs.filter((log) => log.isAchievement).length
            return (
              <section key={group.key} className="border-t border-gray-200 py-3 first:border-t-0">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.key)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2">
                    {open ? (
                      <KeyboardArrowDown aria-hidden sx={{ fontSize: 20 }} />
                    ) : (
                      <KeyboardArrowRight aria-hidden sx={{ fontSize: 20 }} />
                    )}
                    <span className="font-semibold">{group.label}</span>
                    {group.range && <span className="text-gray-500">· {group.range}</span>}
                  </span>
                  <span className="text-gray-500">
                    {group.logs.length} {group.logs.length === 1 ? 'log' : 'logs'}
                    {!open &&
                      achievementCount > 0 &&
                      ` · ${achievementCount} ${achievementCount === 1 ? 'achievement' : 'achievements'}`}
                  </span>
                </button>
                {open && (
                  <ul className="mt-3 flex flex-col">
                    {' '}
                    {group.logs.map((log, index) => (
                      <LogItem
                        key={log.id}
                        log={log}
                        dateLabel={formatLogDate(log.loggedAt, group.key)}
                        onToggleAchievement={handleToggleAchievement}
                        toggling={toggleId === log.id}
                        isFirst={index === 0}
                        isLast={index === group.logs.length - 1}
                      />
                    ))}
                  </ul>
                )}
              </section>
            )
          })}
        </div>
      ) : achievements.length === 0 ? (
        <p className="text-sm text-gray-500">
          No achievements yet. Mark a log as an achievement when you add it.
        </p>
      ) : (
        <ul className="flex flex-col">
          {achievements.map((log) => (
            <AchievementItem
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
  onToggleAchievement: (log: IRawLogModel) => void
  toggling: boolean
  isFirst: boolean
  isLast: boolean
}

const formatLogDate = (loggedAt: string, groupKey: string) => {
  const date = parseISO(loggedAt)
  if (groupKey !== 'upcoming') return format(date, 'EEE d')
  return format(date, isSameYear(date, new Date()) ? 'd MMM' : 'd MMM yyyy')
}

function LogItem({ log, dateLabel, onToggleAchievement, toggling, isFirst, isLast }: LogItemProps) {
  const [expanded, setExpanded] = useState(false)
  const isLong = (log.description?.length ?? 0) > 140
  return (
    <li className="grid grid-cols-[72px_24px_1fr] items-start gap-x-3 py-3">
      <p className="pt-0.5 text-right text-sm text-gray-500">{dateLabel}</p>

      <div className="relative flex justify-center self-stretch pt-1.5">
        {!isFirst && (
          <span className="absolute -top-3 left-1/2 h-6 w-0.5 -translate-x-1/2 bg-gray-200" />
        )}
        {!isLast && (
          <span className="absolute -bottom-3 left-1/2 top-3 w-0.5 -translate-x-1/2 bg-gray-200" />
        )}
        <span className="relative z-10 h-3 w-3 rounded-full border border-gray-500 bg-white" />
      </div>

      <div className="min-w-0">
        <p className="font-semibold text-gray-700">{log.title}</p>
        {log.description && (
          <>
            <p className={`text-sm text-gray-600 ${expanded ? '' : 'line-clamp-2'}`}>
              {log.description}
            </p>
            {isLong && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="text-sm font-semibold text-gray-900"
              >
                {expanded ? 'View less' : 'View more'}
              </button>
            )}
          </>
        )}

        <div className="mt-2 flex items-center justify-between">
          {log.skillTitle ? (
            <Chip label={log.skillTitle} size="small" variant="outlined" />
          ) : (
            <span />
          )}
          <button
            type="button"
            role="checkbox"
            aria-checked={log.isAchievement}
            disabled={toggling}
            onClick={() => onToggleAchievement(log)}
            className="flex cursor-pointer items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span
              aria-hidden
              className={`flex h-4 w-4 justify-center items-center rounded-full border ${
                log.isAchievement ? ' bg-gray-700 border-gray-700 text-white' : 'border-gray-700'
              }`}
            >
              {log.isAchievement && <Check sx={{ fontSize: 12, fontWeight: 900 }} />}
            </span>
            Achievement
          </button>
        </div>
      </div>
    </li>
  )
}
