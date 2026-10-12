import {
  endOfWeek,
  format,
  isSameMonth,
  isSameYear,
  parseISO,
  startOfWeek,
  subWeeks,
} from 'date-fns'
import type { IRawLogModel } from '@/interfaces/raw-log.model'

export interface ILogGroup {
  key: string
  label: string
  range: string | null
  logs: IRawLogModel[]
}

const WEEK = { weekStartsOn: 1 } as const
const formatRange = (from: Date, to: Date) => `${format(from, 'dd MMM')} – ${format(to, 'dd MMM')}`

/**
 * Groups logs by period relative to `now` (device local time).
 * `logs` must already be sorted newest first (the `logs` API does this) —
 * groups come out in the order their first log appears.
 */
export function groupLogsByPeriod(logs: IRawLogModel[], now = new Date()): ILogGroup[] {
  const thisWeekStart = startOfWeek(now, WEEK)
  const thisWeekEnd = endOfWeek(now, WEEK)
  const lastWeekStart = subWeeks(thisWeekStart, 1)
  const groups = new Map<string, ILogGroup>()

  for (const log of logs) {
    const date = parseISO(log.loggedAt)
    let key: string
    let label: string
    let range: string | null = null

    if (date > thisWeekEnd) {
      key = 'upcoming'
      label = 'Upcoming'
    } else if (date >= thisWeekStart) {
      key = 'this-week'
      label = 'This week'
      range = formatRange(thisWeekStart, thisWeekEnd)
    } else if (date >= lastWeekStart) {
      key = 'last-week'
      label = 'Last week'
      range = formatRange(lastWeekStart, endOfWeek(lastWeekStart, WEEK))
    } else if (isSameMonth(date, now)) {
      key = 'earlier-this-month'
      label = 'Earlier this month'
    } else {
      key = format(date, 'yyyy-MM')
      label = format(date, isSameYear(date, now) ? 'MMMM' : 'MMMM yyyy')
    }

    if (!groups.has(key)) groups.set(key, { key, label, range, logs: [] })
    groups.get(key)!.logs.push(log)
  }

  return [...groups.values()]
}
