import * as yup from 'yup'

export const createCompetencySchema = yup.object({
  name: yup.string().required('Name is required').max(60, 'Keep it under 60 characters'),
})

export type CreateCompetencyFormValues = yup.InferType<typeof createCompetencySchema>
