export interface RawLogFormValues {
  goalId: string
  description: string
  competencyIds: string[]
}

export function validateRawLogForm(
  values: RawLogFormValues
): Partial<Record<keyof RawLogFormValues, string>> {
  const errors: Partial<Record<keyof RawLogFormValues, string>> = {}

  if (!values.goalId) errors.goalId = 'Pick a goal'

  const description = values.description.trim()
  if (!description) errors.description = 'Description is required'
  else if (description.length > 500) errors.description = 'Keep it under 500 characters'

  if (values.competencyIds.length === 0) errors.competencyIds = 'Pick at least one skill'

  return errors
}
