'use client'
import { useState, type FormEvent } from 'react'
import {format, isValid} from 'date-fns'
import {validateGoalForm} from '@/modules/goals/schema'
import { GoalsApi } from '@/api/goals'
import { Input } from '@/atoms/input'
import { Textarea } from '@/atoms/textarea'
import { Button } from '@/atoms/button'
import { DatePicker } from '@/atoms/date-picker'

import {useRouter} from 'next/navigation'
import {ROUTES} from '@/constants/routes'

const toDateString = (d: Date | null) => (d && isValid(d) ? format(d, 'yyyy-MM-dd') : '')

export function OnboardingForm() {

    const router = useRouter()
    // ---- SET STATE ---
    const [title,setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [titleError, setTitleError] = useState('')
    const [startDate, setStartDate] = useState<Date | null>(null)
    const [endDate, setEndDate] = useState<Date | null>(null)
    const [startDateError, setStartDateError] = useState('')
    const [endDateError, setEndDateError] = useState('')
    const [submitting, setSubmitting] = useState (false)
    const [serverError, setServerError] = useState ('')
    const isComplete = Boolean(title.trim() && startDate && endDate)

    // ---- HANDLERS ---
    const handleSubmit = async(e: FormEvent) => {
        e.preventDefault()

        const values = {
            title,
            startDate: toDateString(startDate),
            endDate: toDateString(endDate),
            description,
        }

        const errors = validateGoalForm(values)
        setTitleError(errors.title ?? '')
        setStartDateError(errors.startDate ?? '')
        setEndDateError(errors.endDate ?? '')
        if (Object.keys(errors).length > 0) return

        setSubmitting (true)
        setServerError('')
        try {
            await GoalsApi.create(values)
            router.push(ROUTES.GOALS.LIST)
        } catch (err) {
            setServerError ((err as Error).message)
            setSubmitting(false)
        }
    }


    return (
        //---- JSX ----
        <div className="mx-auto w-full max-w-4xl px-6 py-10">
            <h1 className="text-2xl font-semibold text-slate-900"> Create your first goal</h1>
            <p className="mt-1 text-sm text-slate-500">Pick one thing you want to show at your next performance review. You&apos;ll log work against it, so nothing gets forgotten. You can add more goals later.</p>
            <form noValidate className="mx-auto mt-6 flex max-w-md flex-col gap-4"
                onSubmit={handleSubmit}
            >
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label htmlFor="goal-title" className="text-sm font-medium text-slate-700">
                            Goal <span className="text-red-600">*</span>
                        </label>
                        <Input 
                            id="goal-title"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            slotProps={{htmlInput: {maxLength:120}}}
                            error={Boolean(titleError)}
                            helperText={titleError}
                         />
                        <p className="self-end text-xs text-slate-500"> {title.length}/120</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label htmlFor="goal-start-date" className="text-sm font-medium text-slate-700">
                                Start date <span className="text-red-600">*</span>
                            </label>
                            <DatePicker
                                value={startDate}
                                onChange={(d) => setStartDate(d as Date | null)}
                                slotProps={{ textField: { 
                                    id: "goal-start-date", 
                                    size: 'small', 
                                    fullWidth: true,
                                    error: Boolean(startDateError),
                                    helperText: startDateError,
                                 },
                                 }}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="goal-end-date" className="text-sm font-medium text-slate-700">
                                End date <span className="text-red-600">*</span>
                            </label>
                            <DatePicker
                                value={endDate}
                                onChange={(d) => setEndDate(d as Date | null)}
                                minDate={startDate ?? undefined}
                                slotProps={{ textField: { 
                                    id: "goal-end-date", 
                                    size: 'small', 
                                    fullWidth: true,
                                    error: Boolean(endDateError),
                                    helperText: endDateError,
                                }, 
                                }}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="goal-description" className="text-sm font-medium text-slate-700">
                            Description
                        </label>
                        <Textarea 
                            id="goal-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            slotProps={{htmlInput: {maxLength: 500}}}
                        />
                        <p className="self-end text-xs text-slate-500"> {description.length}/500</p>
                    </div>
                    {serverError && <p className="text-sm text-red-600">{serverError}</p>}
                    <Button type="submit" className="h-10 self-end" disabled={!isComplete || submitting}
                        sx={{textTransform: 'none', fontWeight:600 }}
                    >
                        Create Goal
                    </Button>
                </div>
            </form>
        </div>

    )
}