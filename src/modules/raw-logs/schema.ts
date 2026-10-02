import * as yup from 'yup'

export const createRawLogSchema = yup.object({
  goalId: yup.string().required('Pick a goal'),
  description: yup
    .string()
    .required('Description is required')
    .max(500, 'Keep it under 500 characters'),
  competencyIds: yup
    .array()
    .of(yup.string().required())
    .min(1, 'Pick at least one skill')
    .required(),
})

export type CreateRawLogFormValues = yup.InferType<typeof createRawLogSchema>
