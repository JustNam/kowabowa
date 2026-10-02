import { PageLayout } from '@/components/PageLayout'
import { RawLogsList } from '@/modules/raw-logs/components/list'

export default function LogsListPage() {
  return (
    <PageLayout title="Daily logs" subtitle="Everything you've logged, across all goals.">
      <RawLogsList />
    </PageLayout>
  )
}
