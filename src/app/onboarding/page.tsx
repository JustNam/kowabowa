'use client'

// TODO: build the Onboarding page — shown once, right after signup.
// - Same fields/validation as the regular Create Goal modal
//   (src/modules/goals/components/create): title, startDate, endDate
//   (both required, end >= start), description (optional). Reuse
//   `validateGoalForm` from '@/modules/goals/schema' and
//   `GoalsApi.create()` from '@/api/goals' rather than rewriting
//   validation from scratch.
// - Keep the submit button disabled until title/startDate/endDate are
//   filled in.
// - On success, redirect to ROUTES.DASHBOARD ('@/constants/routes').
export default function OnboardingPage() {
  return null
}
