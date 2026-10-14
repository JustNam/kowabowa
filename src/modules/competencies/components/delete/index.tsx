'use client'

import { useState, useEffect } from 'react'
import { CompetenciesApi } from '@/api/competencies'
import { Button } from '@/atoms/button'
import { Modal } from '@/atoms/modal'
import type { ICompetencyModel } from '@/interfaces/competency.model'
import{RawLogsApi} from '@/api/rawLogs'
import CircularProgress from '@mui/material/CircularProgress'

interface CompetenciesDeleteProps {
  skill: ICompetencyModel   
  onClose: () => void
  onDeleted: () => void
}

export function CompetenciesDelete({ skill, onClose, onDeleted }: CompetenciesDeleteProps) {
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [logCount, setLogCount] = useState<number | null>(null)
  
  useEffect(() => {
      let cancelled = false

      RawLogsApi.list()
        .then(({ data }) => {
          if (cancelled) return
          //.filter: giữ lại những log có skillId trùng với skill đang xoá
          //.length: đếm xem còn lại bao nhiêu log
          const count = data.filter((log) => log.skillId === skill.id).length
          setLogCount(count)
        })
        .catch(() => {
          if (!cancelled) setError('Could not check logs for this skill. Please try again.')
        })
      return () => {
        cancelled = true
      }
      //[skill.id]: chạy lại nếu đổi sang skill khác. Thực tế popup được tạo mới mỗi lần mở
      //(list dùng key={deletingSkill.id}), nên effect chỉ chạy 1 lần.
    }, [skill.id])

      const isChecking = logCount === null && !error
      const isInUse = logCount !== null && logCount > 0
      const canDelete = logCount === 0
      const logLabel = logCount === 1 ? '1 log' : `${logCount} logs`
      const title = isInUse ? 'Can’t delete this skill' : 'Delete this skill?'
    
  const handleClose = () => {
    onClose()
  }

  const handleDelete = async () => {
    setSubmitting(true)
    setError(null)
    try {
      await CompetenciesApi.remove(skill.id)
      onDeleted()
      handleClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      if (message === 'Skill is used in logs') {
        setError('This skill was just added to a log, so it can’t be deleted.')
      } else {
        setError('Could not delete the skill. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
  <Modal open onClose={handleClose} title={title}>
      <div className="flex flex-col gap-4 pt-1">

        {isChecking && (
          <div className="flex items-center gap-2">
            <CircularProgress size={16} />
            <p className="text-sm text-gray-500">Checking logs…</p>
          </div>
        )}

        {isInUse && (
          <p className="text-sm">
            &ldquo;<strong>{skill.title}</strong>&rdquo; is used in {logLabel}, so it can’t be deleted.
          </p>
        )}

        {canDelete && (
          <p className="text-sm">
            &ldquo;<strong>{skill.title}</strong>&rdquo; isn’t used in any log, it will be permanently deleted.
          </p>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="-mx-6 flex justify-end gap-2 border-t border-gray-200 px-6 pt-4">

          {isInUse && (
            <Button type="button" onClick={handleClose}>
              Got it
            </Button>
          )}

          {canDelete && (
          <><Button type="button" variant="ghost" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={submitting}>
                {submitting ? 'Deleting…' : 'Delete skill'}
            </Button></>
          )}

          {(isChecking || error) && !isInUse && !canDelete &&(
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
