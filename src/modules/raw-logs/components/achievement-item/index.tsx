'use client'

import { Chip } from '@mui/material'
import { Hexagon, StarRounded } from '@mui/icons-material'
import type { IRawLogModel } from '@/interfaces/raw-log.model'

interface AchievementItemProps {
  log: IRawLogModel
  dateLabel: string
}

export function AchievementItem({ log, dateLabel }: AchievementItemProps) {
  return (
    <li className="flex items-start gap-4 border-b border-gray-200 py-4 last:border-b-0">
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100">
        <Hexagon sx={{ fontSize: 36, color: '#black' }} />
        <StarRounded sx={{ fontSize: 16, color: '#fff' }} className="absolute" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{log.title}</p>
        {log.skillTitle && (
          <div className="mt-2">
            <Chip label={log.skillTitle} size="small" variant="outlined" />
          </div>
        )}
      </div>
      <span className="shrink-0 self-start pt-0.5 text-sm text-gray-500">{dateLabel}</span>
    </li>
  )
}
