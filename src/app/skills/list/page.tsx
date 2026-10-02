import { PageLayout } from '@/components/PageLayout'
import { CompetenciesList } from '@/modules/competencies/components/list'

export default function SkillsListPage() {
  return (
    <PageLayout title="Skills" subtitle="Competencies you're tracking and growing.">
      <CompetenciesList />
    </PageLayout>
  )
}
