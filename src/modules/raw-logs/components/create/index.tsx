'use client'

import { useRouter } from 'next/navigation'
import { ROUTES } from '@/constants/routes'

import { Modal } from '@/atoms/modal'
import { Input } from '@/atoms/input'
import { Textarea } from '@/atoms/textarea'
import { DatePicker } from '@/atoms/date-picker'
import { Button } from '@/atoms/button'
import { MenuItem, Chip } from '@mui/material'
import { Check } from '@mui/icons-material'
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
import { CompetenciesCreate } from '@/modules/competencies/components/create'

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
  /** Edit mode: the form is prefilled from this log and saving updates it. */
  log?: IRawLogModel
}

interface RawLogsFormProps {
  onClose: () => void
  onCreated: () => void
  onAchievement?: (info: { log: IRawLogModel; goal: IGoalModel }) => void
  onLogAdded?: (log: IRawLogModel) => void
  defaultGoalId?: string
  skillModalOpen: boolean
  onSkillModalChange: (open: boolean) => void
  editingLog?: IRawLogModel
}

const ADD_NEW_SKILL = '__add_new_skill__'

export function RawLogsForm({
  onClose,
  onCreated,
  onAchievement,
  onLogAdded,
  defaultGoalId,
  skillModalOpen,
  onSkillModalChange,
  editingLog,
}: RawLogsFormProps) {
  const [values, setValues] = useState<RawLogFormValues>({
    title: editingLog?.title ?? '',
    description: editingLog?.description ?? '',
    goalId: editingLog?.goalId ?? defaultGoalId ?? '',
    skillId: editingLog?.skillId ?? '',
    loggedAt: editingLog ? editingLog.loggedAt.slice(0, 10) : format(new Date(), 'yyyy-MM-dd'),
    isAchievement: editingLog?.isAchievement ?? false,
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
      if (editingLog) {
        await RawLogsApi.update(editingLog.id, values)
        onCreated()
        onClose()
        return
      }

      const { data: log } = await RawLogsApi.create(values)
      onCreated()
      onClose()
      if (log.isAchievement) {
        const { data: freshGoals } = await GoalsApi.list() // Check if goal is deleted?
        const goal = freshGoals.find((g) => g.id === log.goalId)
        if (goal) onAchievement?.({ log, goal })
        else onLogAdded?.(log)
      } else {
        onLogAdded?.(log)
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
        onChange={(e) => {
          setValues({ ...values, title: e.target.value })
          setErrors({ ...errors, title: undefined })
        }}
        error={Boolean(errors.title)}
        helperText={errors.title}
      />

      <Select
        label="Goal"
        placeholder="Select a goal"
        required
        value={values.goalId}
        onChange={(e) => {
          setValues({ ...values, goalId: e.target.value })
          setErrors({ ...errors, goalId: undefined })
        }}
        error={Boolean(errors.goalId)}
        helperText={errors.goalId}
        disabled={Boolean(defaultGoalId) || Boolean(editingLog)}
        sx={{
          '& .Mui-disabled, & .MuiSelect-select.Mui-disabled': { cursor: 'not-allowed' },
        }}
        slotProps={{
          select: {
            // The goals list loads after the modal opens; show "Loading..." instead of a blank field.
            renderValue: (selected) =>
              goals.find((g) => g.id === selected)?.title ??
              (goals.length === 0 ? 'Loading...' : ''),
          },
        }}
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
        onChange={(date) => {
          setValues({
            ...values,
            loggedAt: date && isValid(date) ? format(date, 'yyyy-MM-dd') : '',
          })
          setErrors({ ...errors, loggedAt: undefined })
        }}
        slotProps={{
          textField: {
            size: 'small',
            fullWidth: true,
            required: true,
            error: Boolean(errors.loggedAt),
            helperText: errors.loggedAt,
          },
        }}
      />

      <Select
        label="Skill"
        placeholder="Select a skill"
        value={values.skillId}
        onChange={(e) => {
          if (e.target.value === ADD_NEW_SKILL) {
            onSkillModalChange(true)
            return
          }
          setValues({ ...values, skillId: e.target.value })
        }}
        slotProps={{
          select: {
            MenuProps: {
              slotProps: {
                paper: { sx: { overflow: 'hidden' } },
                list: {
                  sx: {
                    maxHeight: 'min(280px, 50vh)',
                    overflowY: 'auto',
                    pb: 0,
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#D1D5DB transparent',
                  },
                },
              },
            },
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
        <MenuItem
          value={ADD_NEW_SKILL}
          sx={{
            position: 'sticky',
            bottom: 0,
            gap: 1,
            fontWeight: 600,
            bgcolor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider',
            '&:hover, &.Mui-focusVisible': { bgcolor: '#F5F5F5' },
          }}
        >
          <span aria-hidden>+</span> Add new skill
        </MenuItem>
      </Select>

      <CompetenciesCreate
        open={skillModalOpen}
        onClose={() => onSkillModalChange(false)}
        onCreated={() => {
          CompetenciesApi.list().then(({ data }) => setSkills(data))
        }}
      />

      <Textarea
        label="Description"
        placeholder="Add details about what you did"
        value={values.description}
        onChange={(e) => {
          setValues({ ...values, description: e.target.value })
          setErrors({ ...errors, description: undefined })
        }}
        error={Boolean(errors.description)}
        helperText={errors.description}
      />
      {submitError && <p className="text-sm text-red-600">{submitError}</p>}
      <div className="flex items-center justify-between">
        <button
          type="button"
          role="checkbox"
          aria-checked={values.isAchievement}
          onClick={() => setValues({ ...values, isAchievement: !values.isAchievement })}
          className="flex cursor-pointer items-center gap-2 text-sm font-medium"
        >
          <span
            aria-hidden
            className={`flex h-4 w-4 items-center justify-center rounded-full border ${
              values.isAchievement ? 'bg-gray-700 border-gray-700 text-white' : 'border-gray-700'
            }`}
          >
            {values.isAchievement && <Check sx={{ fontSize: 12, fontWeight: 900 }} />}
          </span>
          Achievement
        </button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {editingLog ? 'Save changes' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function RawLogsCreate({
  open,
  onClose,
  onCreated,
  defaultGoalId,
  log,
}: RawLogsCreateProps) {
  const router = useRouter()
  const [achievement, setAchievement] = useState<IachievementInfo | null>(null)
  const [skillModalOpen, setSkillModalOpen] = useState(false)

  const goToLog = (log: IRawLogModel, tab: 'logs' | 'achievements') =>
    router.push(`${ROUTES.GOALS.DETAIL(log.goalId)}?tab=${tab}&logId=${log.id}`)

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={log ? 'Edit log' : 'Add log'}
        hidden={skillModalOpen}
      >
        <RawLogsForm
          onClose={onClose}
          onCreated={onCreated}
          onAchievement={setAchievement}
          onLogAdded={(log) => goToLog(log, 'logs')}
          defaultGoalId={defaultGoalId}
          editingLog={log}
          skillModalOpen={skillModalOpen}
          onSkillModalChange={setSkillModalOpen}
        />
      </Modal>

      {achievement && (
        <AchievementModal
          open
          onClose={() => {
            goToLog(achievement.log, 'logs')
            setAchievement(null)
          }}
          onView={() => {
            goToLog(achievement.log, 'achievements')
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
