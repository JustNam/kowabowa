'use client'

import { useRouter } from 'next/navigation'
import { ROUTES } from '@/constants/routes'

import { Modal } from '@/atoms/modal'
import { Input } from '@/atoms/input'
import { Textarea } from '@/atoms/textarea'
import { DatePicker } from '@/atoms/date-picker'
import { Button } from '@/atoms/button'
import { MenuItem, Checkbox, FormControlLabel, Chip } from '@mui/material'
import { Select } from '@/atoms/select'
import { AchievementModal } from '../achievement-modal'
import { useState, useEffect } from 'react'
import { validateRawLogForm, type RawLogFormValues } from '../../schema'
import { format, parse, isValid } from 'date-fns'
import { GoalsApi } from '@/api/goals'
import { RawLogsApi } from '@/api/rawLogs'
import { CompetenciesApi } from '@/api/competencies'
import type { IGoalModel } from '@/interfaces/goal.model'
import type { IRawLogModel } from '@/interfaces/raw-log.model'
import type { ICompetencyModel } from '@/interfaces/competency.model'

export interface IachievementInfo {
  log: IRawLogModel
  goal: IGoalModel
}

interface RawLogsCreateProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
  /** Pre-fill and lock the goal when opened from a Goal detail page. */
  defaultGoalId?: string
}

interface RawLogsFormProps {
  onClose: () => void
  onCreated: () => void
  onAchievement?: (info: { log: IRawLogModel; goal: IGoalModel }) => void
}

// TODO: build the Log work form, rendered inside the Modal below.
// - Fields: goal picker (select among the user's goals), description
//   (what did you do?), and a competency/skill picker (one
//   skill demonstrated). Validate with `validateRawLogForm` from
//   '../../schema'.
// - On submit, call `RawLogsApi.create(values)` from '@/api/rawLogs',
//   then `onCreated()` and `onClose()`.
// - Reuse the Select/Textarea/Button atoms.
// - Create a skill without leaving this modal: the skill dropdown ends with
//   an "Add new skill" action. Clicking it opens `CompetenciesCreate` (from
//   '@/modules/competencies/components/create') on top of this modal. In its
//   `onCreated`, refetch the skill list via `CompetenciesApi.list()` and
//   auto-select the new skill in this form, so the user keeps their place
//   (the other fields they already filled in must not be reset).

export function RawLogsForm({ onClose, onCreated, onAchievement }: RawLogsFormProps) {
  const [values, setValues] = useState<RawLogFormValues>({
    title: '',
    description: '',
    goalId: '',
    skillId: '',
    loggedAt: format(new Date(), 'yyyy-MM-dd'),
    isAchievement: false,
  })

  const [goals, setGoals] = useState<IGoalModel[]>([])
  useEffect(() => {
    GoalsApi.list().then(({ data }) => setGoals(data))
  }, [])

  const [skills, setSkills] = useState<ICompetencyModel[]>([])
  useEffect(() => {
    CompetenciesApi.list().then(({ data }) => setSkills(data))
  }, [])

  const [errors, setErrors] = useState<Partial<Record<keyof RawLogFormValues, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async () => {
    const validationErrors = validateRawLogForm(values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setSubmitting(true)
    setSubmitError(null)
    try {
      const { data: log } = await RawLogsApi.create(values)
      onCreated()
      onClose()
      if (log.isAchievement) {
        const { data: freshGoals } = await GoalsApi.list()
        const goal = freshGoals.find((g) => g.id === log.goalId)
        if (goal) onAchievement?.({ log, goal })
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not save the log')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        label="Log"
        required
        placeholder="What did you do?"
        value={values.title}
        onChange={(e) => setValues({ ...values, title: e.target.value })}
        error={Boolean(errors.title)}
        helperText={errors.title}
      />

      <Select
        label="Goal"
        placeholder="Select a goal"
        required
        value={values.goalId}
        onChange={(e) => setValues({ ...values, goalId: e.target.value })}
        error={Boolean(errors.goalId)}
        helperText={errors.goalId}
      >
        {goals.map((goal) => (
          <MenuItem key={goal.id} value={goal.id}>
            {goal.title}
          </MenuItem>
        ))}
      </Select>

      <DatePicker
        label="Date"
        format="dd/MM/yyyy"
        value={values.loggedAt ? parse(values.loggedAt, 'yyyy-MM-dd', new Date()) : null}
        onChange={(date) =>
          setValues({
            ...values,
            loggedAt: date && isValid(date) ? format(date, 'yyyy-MM-dd') : '',
          })
        }
        slotProps={{
          textField: {
            size: 'small',
            fullWidth: true,
            error: Boolean(errors.loggedAt),
            helperText: errors.loggedAt,
          },
        }}
      />

      <Select
        label="Skill"
        placeholder="Select a skill"
        value={values.skillId}
        onChange={(e) => setValues({ ...values, skillId: e.target.value })}
        slotProps={{
          select: {
            renderValue: (selected) => {
              const skill = skills.find((s) => s.id === (selected as string))
              if (!skill) return null
              return (
                <Chip
                  label={skill.title}
                  size="small"
                  onDelete={() => setValues({ ...values, skillId: '' })}
                  onMouseDown={(e) => e.stopPropagation()}
                />
              )
            },
          },
        }}
      >
        {skills.map((skill) => (
          <MenuItem key={skill.id} value={skill.id}>
            {skill.title}
          </MenuItem>
        ))}
      </Select>

      <Textarea
        label="Description"
        placeholder="Add details about what you did"
        value={values.description}
        onChange={(e) => setValues({ ...values, description: e.target.value })}
        error={Boolean(errors.description)}
        helperText={errors.description}
      />
      {submitError && <p className="text-sm text-red-600">{submitError}</p>}
      <div className="flex items-center justify-between">
        <FormControlLabel
          control={
            <Checkbox
              checked={values.isAchievement}
              onChange={(e) => setValues({ ...values, isAchievement: e.target.checked })}
            />
          }
          label="Achievement"
        />
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}

export function RawLogsCreate({ open, onClose, onCreated }: RawLogsCreateProps) {
  const router = useRouter()
  const [achievement, setAchievement] = useState<IachievementInfo | null>(null)
  return (
    <>
      <Modal open={open} onClose={onClose} title="Add log">
        <RawLogsForm onClose={onClose} onCreated={onCreated} onAchievement={setAchievement} />
      </Modal>

      {achievement && (
        <AchievementModal
          open
          onClose={() => setAchievement(null)}
          onView={() => {
            router.push(ROUTES.GOALS.DETAIL(achievement.goal.id))
            setAchievement(null)
          }}
          goalTitle={achievement.goal.title}
          logTitle={achievement.log.title}
          loggedAt={achievement.log.loggedAt}
          achievementCount={achievement.goal.achievementsCount}
        />
      )}
    </>
  )
}
