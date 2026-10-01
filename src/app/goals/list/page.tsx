import { PageLayout } from '@/components/PageLayout'
import { GoalsList } from '@/modules/goals/components/list'

export default function GoalsListPage() {
  return (
    <PageLayout title="Goals" subtitle="Everything you're working toward right now.">
      <GoalsList />
    </PageLayout>
  )
}
