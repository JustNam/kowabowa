import { PageLayout } from '@/components/PageLayout'

// TODO: build the Dashboard.
// - This is the post-login landing page (ROUTES.POST_LOGIN_REDIRECT).
// - An empty-state is enough for now: a short message + a link/button to
//   ROUTES.GOALS.LIST. Use next/link and the Button atom ('@/atoms/button').
// - No data fetching needed — the populated dashboard (goal stats, recent
//   activity) is a later iteration, not part of this exercise.
export default function DashboardPage() {
  return (
    <PageLayout title="Dashboard">
      {/* TODO: empty-state content */}
      {null}
    </PageLayout>
  )
}
