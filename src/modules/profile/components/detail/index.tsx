'use client'
import { useEffect, useState } from 'react'
// import {parseISO} from 'date-fns'
import { ProfilesApi } from '@/api/profiles'
import { Button } from '@/atoms/button'
import { format, parseISO } from 'date-fns'
import { Modal } from '@/atoms/modal'

export function ProfileDetail() {

  //  --- SET STATE --- //
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null)
  const [firstNameError, setFirstNameError] = useState('')
  const [lastNameError, setLastNameError] = useState('')
  const [dateOfBirthError, setDateOfBirthError] = useState('')
  const [loading, setLoading] = useState(true) // Giá trị đầu = true -> form phải chờ dữ liệu ngay từ lần render đầu
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const [editOpen, setEditOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        // gọi ProfilesApi.me() và set state
        const { data } = await ProfilesApi.me()
        setFirstName(data.firstName ?? '')
        setLastName(data.lastName ?? '')
        setEmail(data.email)
        setDateOfBirth(data.dateOfBirth ? parseISO(data.dateOfBirth) : null)
      } catch (err) {
        //set serverError
        setServerError((err as Error).message)
      } finally {
        //tắt loading
        setLoading(false)
      }
    }
    load()
  }, [])

  // // JSX tạm
  // if (loading) return <p>Loading...</p>
  // return (
  //     <div>
  //         <p>{firstName} {lastName} </p>
  //         <p>{email}</p>
  //         <p>{dateOfBirth?.toDateString()}</p>
  //         {serverError && <p className="text-sm text-red-600">{serverError}</p>}
  //     </div>
  // )

  // 3 giá trị goals, logs, skills used tính sẵn
  const fullName = `${firstName} ${lastName}`.trim() || 'Not set'
  const initials = (firstName && lastName ? firstName[0] + lastName[0] : email[0] ?? '').toUpperCase()
  const dobText = dateOfBirth ? format(dateOfBirth, 'dd/MM/yyyy') : 'Not set'

  // --- JSX ---
  if (loading) return <p>Loading...</p>
  return (
    <div className="flex flex-col gap-8">
      {/* Avatar + Tên + Email + Button edit */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-xl font-semibold text-white">
            {initials}
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900"> {fullName} </p>
            <p className="text-sm text-slate-500"> {email} </p>
          </div>
        </div>
        <Button variant="secondary" onClick={() => setEditOpen(true)}>
          Edit
        </Button>
      </div>

      {/* Basic info */}
      <section>
        <h2 className="text-base font-semibold text-slate-900">Basic info</h2>
        <dl className="mt-3 grid grid-cols-[160px_1fr] gap-y-2 text-sm">
          <dt className="text-slate-500">First name</dt>
          <dd className="text-slate-900">{firstName || 'Not set'}</dd>
          <dt className="text-slate-500">Last name</dt>
          <dd className="text-slate-900">{lastName || 'Not set'}</dd>
          <dt className="text-slate-500">Email</dt>
          <dd className="text-slate-900">{email}</dd>
          <dt className="text-slate-500">Date of birth</dt>
          <dd className="text-slate-900">{dobText}</dd>
        </dl>
      </section>
      <section>
        <h2 className="text-base font-semibold text-slate-900">Statistics</h2>
        <div className="mt-3 grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-2xl font-semibold text-slate-900">0</p>
            <p className="text-sm text-slate-900">Goals</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-2xl font-semibold text-slate-900">0</p>
            <p className="text-sm text-slate-900">Logs</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-2xl font-semibold text-slate-900">0</p>
            <p className="text-sm text-slate-900">Skills used</p>
          </div>
        </div>
      </section>
    {serverError && <p className ="text-sm text-red-600">{serverError}</p>}
    </div>
  )

}
