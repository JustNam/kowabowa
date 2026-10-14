import { PageLayout } from '@/components/PageLayout'
import { ProfileDetail } from '@/modules/profile/components/detail'

export default function ProfilePage() {
  return (
    <PageLayout title="Profile">
      <ProfileDetail />
    </PageLayout>
  )
}