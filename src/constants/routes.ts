/**
 * Centralized, type-safe route constants.
 * Always navigate via ROUTES, never a hardcoded string — see ARCHITECTURE.md#routing.
 */

export const ROUTES = {
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',

  // Where an authenticated user lands after sign-in, and where an
  // unauthenticated user is bounced from a protected route.
  POST_LOGIN_REDIRECT: '/dashboard',

  DASHBOARD: '/dashboard',

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

  // Global log of everything across all goals. Goal-scoped logs are
  // rendered inline on the Goal detail page via RawLogsApi.list(goalId).
  LOGS: {
    LIST: '/logs/list',
  },
} as const
