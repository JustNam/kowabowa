'use client'
import { Modal } from '@/atoms/modal'
import { IProfileModel } from '@/interfaces/profile.model'
import { useState } from 'react'
import { Input } from '@/atoms/input'
import { DatePicker } from '@/atoms/date-picker'
import { Button } from '@/atoms/button'
import { format, isValid } from 'date-fns'
import { ProfilesApi } from '@/api/profiles'

interface ProfileEditProps {
  open: boolean
  onClose: () => void //<- hàm này không trả về gì
  profile: { firstName: string; lastName: string; email: string; dateOfBirth: Date | null }
  onSaved: (data: IProfileModel) => void
}



export function ProfileEdit({ open, onClose, profile, onSaved }: ProfileEditProps) {
  const [firstName, setFirstName] = useState(profile.firstName)
  const [lastName, setLastName] = useState(profile.lastName)
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(profile.dateOfBirth)
  const [firstNameError, setFirstNameError] = useState('')
  const [lastNameError, setLastNameError] = useState('')
  const [dateOfBirthError, setDateOfBirthError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const toDateString = (d: Date | null) => (d && isValid(d) ? format(d, 'yyyy-MM-dd') : '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError('')
    const values = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth: toDateString(dateOfBirth),
    }
    const fnError = values.firstName ? '' : 'First name is required' // có chữ thì lỗi là chuỗi rỗng, còn rỗng thì lỗi là câu thông báo
    setFirstNameError(fnError)
    const lnError = values.lastName ? '' : 'Last name is required'
    setLastNameError(lnError)
    let dobError = ''
    if (!values.dateOfBirth) {
      dobError = 'Date of birth is required'
    } else if (dateOfBirth! > new Date()) {
      dobError = 'Date of birth cannot be in the future'
    }

    setDateOfBirthError(dobError)
    if (fnError || lnError || dobError) return
    setSubmitting(true)
    try {
      const { data } = await ProfilesApi.updateProfile(values)
      onSaved(data)
      onClose()
    } catch (err) {
      setServerError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit profile">
      {/* Form fields + submit handler */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8 pt-2">
        <Input
          required
          size="medium"
          label="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          error={!!firstNameError}
          helperText={firstNameError}
        />
        <Input
          required
          size="medium"
          label="Last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          error={!!lastNameError}
          helperText={lastNameError}
        />
        <Input
          required
          size="medium"
          label="Email"
          disabled
          value={profile.email}
          sx={{ '& .Mui-disabled': { cursor: 'not-allowed' } }}
        />
        <DatePicker
          label="Date of birth"
          value={dateOfBirth}
          disableFuture
          onChange={(d) => setDateOfBirth(d)}
          slotProps={{
            textField: {
              required: true,
              error: !!dateOfBirthError,
              helperText: dateOfBirthError,
              fullWidth: true,
            }
          }}
        />
        {serverError && <p className="text-sm text-red-600">{serverError}</p>}

        <div className="flex justify-end gap-4">
          <Button type="button" variant="secondary" size="large" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="large" disabled={submitting}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  )
}
