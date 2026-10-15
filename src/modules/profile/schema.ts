import {format} from 'date-fns'

export interface ProfileFormValues 
{
  firstName: string
  lastName: string
  dateOfBirth: string
}

export function validateProfileForm (
  values: ProfileFormValues
) : Partial<Record<keyof ProfileFormValues, string >> {

const errors: Partial<Record<keyof ProfileFormValues, string>> = {}
if (!values.firstName.trim()) errors.firstName = "First name is required"

if (!values.lastName.trim()) errors.lastName = "Last name is required"

const today = format(new Date(), 'yyyy-MM-dd')
if (!values.dateOfBirth) errors.dateOfBirth = 'Date of birth is required'
else if (values.dateOfBirth > today) {
  errors.dateOfBirth = 'Date of birth cannot be in the future'
}
return errors
}