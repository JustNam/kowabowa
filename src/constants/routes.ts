/**
 * Centralized, type-safe route constants.
 * Always navigate via ROUTES, never a hardcoded string — see ARCHITECTURE.md#routing.
 */

export const ROUTES = {
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',

  // Where an authenticated user who has finished onboarding lands after
  // sign-in (Goals list — there is no dashboard page). Users who haven't
  // finished onboarding go to ONBOARDING instead — see src/app/login/page.tsx.
  POST_LOGIN_REDIRECT: '/goals/list',

  // Shown once, right after signup — see src/app/onboarding/page.tsx.
  ONBOARDING: '/onboarding',

  // Profile page - see src/app/profile/page.tsx
  PROFILE: '/profile',

  GOALS: {
    LIST: '/goals/list',
    DETAIL: (id: string) => `/goals/${id}`,
    // No CREATE route — Create Goal is a modal (src/modules/goals/components/create),
    // opened from the Goals list, not a page.
  },

  // DB/code name is "competencies" (matches the data model); user-facing
  // copy says "Skills" (matches the product design).
  SKILLS: {
    LIST: '/skills/list',
  },

  // No global logs page — logs are only ever goal-scoped (Goal detail,
  // via RawLogsApi.list(goalId)) or created ad hoc via the sidebar's
  // Quick log button (src/components/Sidebar.tsx), per the design doc.
} as const
