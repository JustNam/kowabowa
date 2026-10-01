import Link from 'next/link'
import { PageLayout } from '@/components/PageLayout'
import { Button } from '@/atoms/button'
import { ROUTES } from '@/constants/routes'

// Empty-state only — the populated dashboard (goal stats, recent activity)
// is a later iteration, not scaffolding. See docs/architecture/PAGE_INVENTORY.md.
export default function DashboardPage() {
  return (
    <PageLayout title="Dashboard">
      <div className="rounded-md border border-dashed border-slate-300 px-6 py-16 text-center">
        <p className="text-slate-500">No goals yet. Once you create one, it'll show up here.</p>
        <Link href={ROUTES.GOALS.LIST} className="mt-4 inline-block">
          <Button>Go to Goals</Button>
        </Link>
      </div>
    </PageLayout>
  )
}
