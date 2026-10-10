'use client'

import { Modal } from '@/atoms/modal'
import { Input } from '@/atoms/input'
import { Textarea } from '@/atoms/textarea'
import { DatePicker } from '@/atoms/date-picker'
import { MenuItem } from '@mui/material'
import { Select } from '@/atoms/select'
import { useState, useEffect } from 'react'
import type { RawLogFormValues } from '../../schema'
import { format, parse, isValid } from 'date-fns'
import { GoalsApi } from '@/api/goals'
import { CompetenciesApi } from '@/api/competencies'
import type { IGoalModel } from '@/interfaces/goal.model'
import type { ICompetencyModel } from '@/interfaces/competency.model'

interface RawLogsCreateProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
  /** Pre-fill and lock the goal when opened from a Goal detail page. */
  defaultGoalId?: string
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

export function RawLogsCreate({ open, onClose }: RawLogsCreateProps) {
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
    if (!open) return
    GoalsApi.list().then(({ data }) => setGoals(data))
  }, [open])

  const [skills, setSkills] = useState<ICompetencyModel[]>([])
  useEffect(() => {
    if (!open) return
    CompetenciesApi.list().then(({ data }) => setSkills(data))
  }, [open])

  return (
    <Modal open={open} onClose={onClose} title="Add log">
      <div className="flex flex-col gap-4">
        <Input
          label="Log"
          required
          placeholder="What did you do?"
          value={values.title}
          onChange={(e) => setValues({ ...values, title: e.target.value })}
        />

        <Select
          label="Goal"
          placeholder="Select a goal"
          required
          value={values.goalId}
          onChange={(e) => setValues({ ...values, goalId: e.target.value })}
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
          slotProps={{ textField: { size: 'small', fullWidth: true } }}
        />

        <Select
          label="Skill"
          placeholder="Select a skill"
          value={values.skillId}
          onChange={(e) => setValues({ ...values, skillId: e.target.value })}
        >
          <MenuItem value="">None</MenuItem>
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
        />
      </div>
    </Modal>
  )
}
