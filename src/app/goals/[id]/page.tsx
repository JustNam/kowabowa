import { PageLayout } from '@/components/PageLayout'
import { GoalsDetail } from '@/modules/goals/components/detail'

export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <PageLayout title="Goal detail">
      <GoalsDetail id={id} />
    </PageLayout>
  )
}
