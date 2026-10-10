export interface RawLogFormValues {
  title: string
  description: string
  goalId: string
  skillId: string
  loggedAt: string
  isAchievement: boolean
}

export function validateRawLogForm(
  values: RawLogFormValues
): Partial<Record<keyof RawLogFormValues, string>> {
  const errors: Partial<Record<keyof RawLogFormValues, string>> = {}

  const title = values.title.trim()
  if (!title) errors.title = 'Title is required'
  else if (title.length > 120) errors.title = 'Keep it under 120 characters'

  if (!values.goalId) errors.goalId = 'Pick a goal'

  if (!values.loggedAt) errors.loggedAt = 'Date is required'

  if (values.description.trim().length > 500) {
    errors.description = 'Keep it under 500 characters'
  }

  return errors
}
