import type { IGoalCreateRequest } from '@/interfaces/goal.model'

export function validateGoalForm(
  values: IGoalCreateRequest
): Partial<Record<keyof IGoalCreateRequest, string>> {
  const errors: Partial<Record<keyof IGoalCreateRequest, string>> = {}
  const title = values.title.trim()

  if (!title) errors.title = 'Title is required'
  else if (title.length > 120) errors.title = 'Keep it under 120 characters'

  if (values.description && values.description.length > 500) {
    errors.description = 'Keep it under 500 characters'
  }

  if (!values.startDate) errors.startDate = 'Start date is required'

  if (!values.endDate) errors.endDate = 'End date is required'
  else if (values.startDate && values.endDate < values.startDate) {
    errors.endDate = 'End date must be on or after the start date'
  }

  return errors
}
