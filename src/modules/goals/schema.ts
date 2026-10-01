import * as yup from 'yup'

export const createGoalSchema = yup.object({
  title: yup.string().required('Title is required').max(120, 'Keep it under 120 characters'),
  description: yup.string().max(500, 'Keep it under 500 characters'),
  targetDate: yup.string(),
})

export type CreateGoalFormValues = yup.InferType<typeof createGoalSchema>
