'use client'

import { Dialog, IconButton } from '@mui/material'
import { format, parseISO } from 'date-fns'
import { Button } from '@/atoms/button'

interface AchievementModalProps {
  open: boolean
  onClose: () => void
  onView: () => void
  goalTitle: string
  logTitle: string
  loggedAt: string
  achievementCount: number
}

export function AchievementModal({
  open,
  onClose,
  onView,
  goalTitle,
  logTitle,
  loggedAt,
  achievementCount,
}: AchievementModalProps) {
  const dateLabel = format(parseISO(loggedAt), 'dd MMM yyyy')
  return (
    <Dialog open={open} onClose={() => onClose()} fullWidth maxWidth="xs">
      <IconButton
        aria-label="Close"
        onClick={onClose}
        size="small"
        sx={{ position: 'absolute', top: 12, right: 12 }}
      >
        ✕
      </IconButton>

      <div className="flex flex-col items-center gap-3 p-6 pt-10 text-center">
        <h2 className="text-2xl font-bold">Congratulations!</h2>
        <p className="text-slate-600">
          You’ve reached a new achievement for your goal{' '}
          <strong className='text-slate-900'>&quot;{goalTitle}&quot;</strong>.
        </p>

        <div className="w-full rounded-lg border border-slate-200 px-4 py-3">
          <p className="truncate font-semibold">{logTitle}</p>
          <p className="text-sm text-slate-500">
            Logged {dateLabel} · {achievementCount}{' '}
            {achievementCount === 1 ? 'achievement' : 'achievements'} in this goal
          </p>
        </div>

        <div className="mt-6 grid w-full grid-cols-2 gap-3">
          <Button variant="secondary" onClick={onView}>
            View achievement
          </Button>
          <Button onClick={onClose}>Keep going</Button>
        </div>
      </div>
    </Dialog>
  )
}
