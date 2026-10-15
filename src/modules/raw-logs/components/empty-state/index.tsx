import type { ReactNode } from 'react'
import { InboxOutlined } from '@mui/icons-material'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center">
      <InboxOutlined sx={{ fontSize: 64, color: '#9CA3AF' }} />
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      {description && <p className="text-sm text-gray-500">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
