'use client'

import { Chip } from '@mui/material'
import { Hexagon, StarRounded } from '@mui/icons-material'
import type { IRawLogModel } from '@/interfaces/raw-log.model'

interface AchievementItemProps {
  log: IRawLogModel
  dateLabel: string
  onRemove: (log: IRawLogModel) => void
  removing: boolean
}

export function AchievementItem({ log, dateLabel, onRemove, removing }: AchievementItemProps) {
  return (
    <li className="group flex items-start gap-4 border-b border-gray-200 py-4 last:border-b-0">
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100">
        <Hexagon sx={{ fontSize: 36, color: '#111827' }} />
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
      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className="pt-0.5 text-sm text-gray-500">{dateLabel}</span>
        <button
          type="button"
          onClick={() => onRemove(log)}
          disabled={removing}
          className="cursor-pointer text-sm font-semibold text-gray-500 opacity-0 transition-opacity hover:text-gray-900 group-hover:opacity-100 group-focus-within:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Remove
        </button>
      </div>
    </li>
  )
}
