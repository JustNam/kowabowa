import * as yup from 'yup'

export const createGoalSchema = yup.object({
  title: yup.string().required('Title is required').max(120, 'Keep it under 120 characters'),
  description: yup.string().max(500, 'Keep it under 500 characters'),
  startDate: yup.string().required('Start date is required'),
  endDate: yup
    .string()
    .required('End date is required')
    .test(
      'end-on-or-after-start',
      'End date must be on or after the start date',
      function (value) {
        const { startDate } = this.parent
        if (!startDate || !value) return true
        return value >= startDate
      }
    ),
})

export type CreateGoalFormValues = yup.InferType<typeof createGoalSchema>
