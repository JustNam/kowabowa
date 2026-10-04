'use client'

interface RawLogsListProps {
  /** Scopes the list to one goal and pre-fills the create modal — the
   * only current caller is the Goal detail page. */
  goalId?: string
}

// TODO: build the Raw logs list.
// - Fetch logs on mount with `RawLogsApi.list(goalId?)` ('@/api/rawLogs');
//   hold them in local state along with loading/error flags.
// - Render each log in a list (description, logged date, linked goal,
//   competencies/skills demonstrated).
// - A "Log work" button that opens the Create log modal — import
//   `RawLogsCreate` from '../create', manage its open/closed state here,
//   and pass it an `onCreated` callback that refetches the list.
export function RawLogsList({}: RawLogsListProps = {}) {
  return null
}
