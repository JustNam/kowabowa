'use client'

import { Chip, Snackbar } from '@mui/material'
import {
  Check,
  DeleteOutlined,
  EditOutlined,
  KeyboardArrowDown,
  KeyboardArrowRight,
  WorkspacePremiumOutlined,
} from '@mui/icons-material'
import { Button } from '@/atoms/button'
import { Modal } from '@/atoms/modal'
import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { IRawLogModel } from '@/interfaces/raw-log.model'
import { RawLogsApi } from '@/api/rawLogs'
import { format, parseISO, isSameYear } from 'date-fns'
import { RawLogsCreate } from '../create'
import { groupLogsByPeriod } from '../../groupLogs'
import { AchievementItem } from '../achievement-item'
import { EmptyState } from '../empty-state'

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
// How long the "Deleted ... Undo" toast stays, and how long the real DELETE request waits.
const UNDO_MS = 5000

export function RawLogsList({ goalId, onChanged }: RawLogsListProps = {}) {
  const [allLogs, setLogs] = useState<IRawLogModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingLog, setEditingLog] = useState<IRawLogModel | null>(null)
  const [deletingLog, setDeletingLog] = useState<IRawLogModel | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const highlightId = searchParams.get('logId')
  const tabParam = searchParams.get('tab')
  const [tab, setTab] = useState<'logs' | 'achievements'>(
    tabParam === 'achievements' ? 'achievements' : 'logs',
  )
  const [prevTabParam, setPrevTabParam] = useState(tabParam)
  if (tabParam !== prevTabParam) {
    setPrevTabParam(tabParam)
    if (tabParam === 'logs' || tabParam === 'achievements') setTab(tabParam)
  }
  const [createOpen, setCreateOpen] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [openOverrides, setOpenOverrides] = useState<Record<string, boolean>>({})
  const [toggleId, setToggleId] = useState<string | null>(null)
  const [toggleError, setToggleError] = useState<string | null>(null)
  const [toastOpen, setToastOpen] = useState(false)
  const [removedLog, setRemovedLog] = useState<IRawLogModel | null>(null)
  const [removeToastOpen, setRemoveToastOpen] = useState(false)
  // Delete with Undo: the log is hidden at once and the real DELETE is sent after UNDO_MS.
  const [pendingDelete, setPendingDelete] = useState<IRawLogModel | null>(null)
  const [deletedLog, setDeletedLog] = useState<IRawLogModel | null>(null)
  const [deleteToastOpen, setDeleteToastOpen] = useState(false)
  const pendingRef = useRef<{ log: IRawLogModel; timer: ReturnType<typeof setTimeout> } | null>(
    null,
  )

  useEffect(() => {
    RawLogsApi.list(goalId)
      .then(({ data }) => {
        setLogs(data)
        setError(null)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [goalId, reloadKey])

  useEffect(() => {
    if (!highlightId) return
    const timer = setTimeout(() => router.replace(pathname, { scroll: false }), 3000)
    return () => clearTimeout(timer)
  }, [highlightId, pathname, router])

  useEffect(() => {
    if (!highlightId || loading) return
    document
      .getElementById(`log-${highlightId}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [highlightId, allLogs, loading, tab])

  useEffect(
    () => () => {
      const pending = pendingRef.current
      if (!pending) return
      clearTimeout(pending.timer)
      RawLogsApi.remove(pending.log.id).catch(() => {})
    },
    [],
  )

  // `silent` skips the toast; the Undo button of the "Removed" toast uses it.
  const handleToggleAchievement = async (log: IRawLogModel, silent = false) => {
    const next = !log.isAchievement
    const apply = (value: boolean) =>
      setLogs((prev) => prev.map((l) => (l.id === log.id ? { ...l, isAchievement: value } : l)))

    setToggleId(log.id)
    setToggleError(null)
    // Optimistic update: change the screen now, send the request after, undo on error.
    apply(next)
    if (!silent) {
      if (log.isAchievement) {
        setRemovedLog(log)
        setToastOpen(false)
        setRemoveToastOpen(true)
      } else {
        setRemoveToastOpen(false)
        setToastOpen(true)
      }
    }
    try {
      await RawLogsApi.setAchievement(log.id, next)
      onChanged?.()
    } catch (err) {
      apply(!next)
      setToastOpen(false)
      setRemoveToastOpen(false)
      setToggleError(err instanceof Error ? err.message : 'Could not update the log')
    } finally {
      setToggleId(null)
    }
  }

  const handleUndoRemove = () => {
    if (!removedLog) return
    setRemoveToastOpen(false)
    // `removedLog` still has isAchievement = true (the value before the removal),
    // so pass a copy with false to make the toggle set it back to true.
    void handleToggleAchievement({ ...removedLog, isAchievement: false }, true)
  }

  const closeDelete = () => setDeletingLog(null)

  const commitDelete = async (log: IRawLogModel) => {
    try {
      await RawLogsApi.remove(log.id)
      setLogs((prev) => prev.filter((l) => l.id !== log.id))
      onChanged?.()
    } catch (err) {
      setToggleError(err instanceof Error ? err.message : 'Could not delete the log')
    } finally {
      // Keep a newer pending delete untouched; only clear this log's own hidden state.
      setPendingDelete((cur) => (cur?.id === log.id ? null : cur))
    }
  }

  const flushPendingDelete = () => {
    const pending = pendingRef.current
    if (!pending) return
    clearTimeout(pending.timer)
    pendingRef.current = null
    void commitDelete(pending.log)
  }

  const handleDelete = () => {
    if (!deletingLog) return
    const log = deletingLog
    flushPendingDelete()
    const timer = setTimeout(() => {
      pendingRef.current = null
      void commitDelete(log)
    }, UNDO_MS)
    pendingRef.current = { log, timer }
    setPendingDelete(log)
    setDeletedLog(log)
    setDeleteToastOpen(true)
    setDeletingLog(null)
  }

  const handleUndoDelete = () => {
    const pending = pendingRef.current
    if (!pending) return
    clearTimeout(pending.timer)
    pendingRef.current = null
    setPendingDelete(null)
    setDeleteToastOpen(false)
  }

  const logs = allLogs.filter((log) => log.id !== pendingDelete?.id)
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
      {tab === 'logs'
        ? logs.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Log your work as you go. You can mark any log as an achievement later.
              </p>
              <Button onClick={() => setCreateOpen(true)}>Add log</Button>
            </div>
          )
        : achievements.length > 0 && (
            <p className="text-sm text-gray-600">
              Logs you marked as real results. Remove one to turn it back into a normal log.
            </p>
          )}

      {tab === 'logs' ? (
        logs.length === 0 ? (
          <EmptyState
            title="No logs yet"
            description="Add your first log to start tracking progress on this goal."
            action={<Button onClick={() => setCreateOpen(true)}>Add log</Button>}
          />
        ) : (
          <div className="flex flex-col">
            {groups.map((group) => {
              const open = isOpen(group.key) || group.logs.some((l) => l.id === highlightId)
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
                          highlighted={log.id === highlightId}
                          isFirst={index === 0}
                          isLast={index === group.logs.length - 1}
                          onEdit={setEditingLog}
                          onDelete={setDeletingLog}
                        />
                      ))}
                    </ul>
                  )}
                </section>
              )
            })}
          </div>
        )
      ) : achievements.length === 0 ? (
        <EmptyState
          title="No achievements yet"
          description="Mark a log as Achievement in the Logs tab to see it here."
        />
      ) : (
        <ul className="flex flex-col">
          {achievements.map((log) => (
            <AchievementItem
              key={log.id}
              log={log}
              dateLabel={format(parseISO(log.loggedAt), 'dd MMM yyyy')}
              onRemove={handleToggleAchievement}
              removing={toggleId === log.id}
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

      {editingLog && (
        <RawLogsCreate
          open
          log={editingLog}
          onClose={() => setEditingLog(null)}
          onCreated={() => {
            setReloadKey((k) => k + 1)
            onChanged?.()
          }}
        />
      )}

      {deletingLog && (
        <Modal open onClose={closeDelete} title="Delete this log?">
          <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-700">
              <strong>“{deletingLog.title}”</strong> will be permanently deleted. If it&apos;s
              marked as an achievement, it will also be removed from Achievements.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={closeDelete}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete log
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={(_, reason) => {
          if (reason === 'clickaway') return
          setToastOpen(false)
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <div className="mb-6 flex items-center gap-3 rounded-lg bg-gray-800 px-4 py-3 text-sm font-medium text-white shadow-lg">
          <Check sx={{ fontSize: 18 }} />
          Marked as achievement
          <button
            type="button"
            onClick={() => {
              setTab('achievements')
              setToastOpen(false)
            }}
            className="cursor-pointer font-semibold underline"
          >
            View
          </button>
        </div>
      </Snackbar>

      <Snackbar
        key={`removed-${removedLog?.id}`}
        open={removeToastOpen}
        autoHideDuration={5000}
        onClose={(_, reason) => {
          if (reason === 'clickaway') return
          setRemoveToastOpen(false)
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <div className="mb-6 flex items-center gap-3 rounded-lg bg-gray-800 px-4 py-3 text-sm font-medium text-white shadow-lg">
          <Check sx={{ fontSize: 18 }} />
          Removed from achievements
          <button
            type="button"
            onClick={handleUndoRemove}
            className="cursor-pointer font-semibold underline"
          >
            Undo
          </button>
        </div>
      </Snackbar>

      <Snackbar
        key={`deleted-${deletedLog?.id}`}
        open={deleteToastOpen}
        autoHideDuration={UNDO_MS}
        onClose={(_, reason) => {
          if (reason === 'clickaway') return
          setDeleteToastOpen(false)
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <div className="mb-6 flex items-center gap-3 rounded-lg bg-gray-800 px-4 py-3 text-sm font-medium text-white shadow-lg">
          <Check sx={{ fontSize: 18 }} />
          <span className="max-w-xs truncate">Deleted “{deletedLog?.title}”</span>
          <button
            type="button"
            onClick={handleUndoDelete}
            className="cursor-pointer font-semibold underline"
          >
            Undo
          </button>
        </div>
      </Snackbar>
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
  highlighted: boolean
  isFirst: boolean
  isLast: boolean
  onEdit: (log: IRawLogModel) => void
  onDelete: (log: IRawLogModel) => void
}

const formatLogDate = (loggedAt: string, groupKey: string) => {
  const date = parseISO(loggedAt)
  if (groupKey !== 'upcoming') return format(date, 'EEE d')
  return format(date, isSameYear(date, new Date()) ? 'd MMM' : 'd MMM yyyy')
}

function LogItem({
  log,
  dateLabel,
  onToggleAchievement,
  toggling,
  highlighted,
  isFirst,
  isLast,
  onDelete,
  onEdit,
}: LogItemProps) {
  const [expanded, setExpanded] = useState(false)
  const isLong = (log.description?.length ?? 0) > 140
  return (
    <li id={`log-${log.id}`} className="grid grid-cols-[88px_24px_1fr] items-start gap-x-3 py-3">
      <p className="whitespace-nowrap pt-0.5 text-right text-sm text-gray-500">{dateLabel}</p>

      <div className="relative flex justify-center self-stretch pt-1.5">
        {!isFirst && (
          <span className="absolute -top-3 left-1/2 h-6 w-0.5 -translate-x-1/2 bg-gray-200" />
        )}
        {!isLast && (
          <span className="absolute -bottom-3 left-1/2 top-3 w-0.5 -translate-x-1/2 bg-gray-200" />
        )}
        {log.isAchievement ? (
          <span className="relative z-10 -mt-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[black] text-white">
            <WorkspacePremiumOutlined sx={{ fontSize: 16 }} />
          </span>
        ) : (
          <span className="relative z-10 h-3 w-3 rounded-full border border-gray-500 bg-white" />
        )}
      </div>

      <div
        className={`group -my-2 min-w-0 rounded-lg px-3 py-2 transition-colors hover:bg-gray-50 ${
          highlighted ? 'bg-gray-100 ring-1 ring-gray-300' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-gray-700">{log.title}</p>
          <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            <button
              type="button"
              aria-label="Edit log"
              onClick={() => onEdit(log)}
              className="cursor-pointer rounded p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-900"
            >
              <EditOutlined sx={{ fontSize: 18 }} />
            </button>
            <button
              type="button"
              aria-label="Delete log"
              onClick={() => onDelete(log)}
              className="cursor-pointer rounded p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-900"
            >
              <DeleteOutlined sx={{ fontSize: 18 }} />
            </button>
          </div>
        </div>

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
            className="flex cursor-pointer items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-200 disabled:cursor-not-allowed"
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
