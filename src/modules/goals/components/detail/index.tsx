'use client'

interface GoalsDetailProps {
  id: string
}

// TODO: build the Goal detail view.
// - Fetch the goal on mount with `GoalsApi.detail(id)` ('@/api/goals');
//   hold it in local state along with an error flag.
// - Render title, status, description (if present), and the
//   start/end date range.
// - Embed the logs for this goal: `<RawLogsList goalId={id} />` from
//   '@/modules/raw-logs/components/list' — that module is already fully
//   built, study it as a reference for the patterns above.
export function GoalsDetail({ id: _id }: GoalsDetailProps) {
  return null
}
