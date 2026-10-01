import axios from 'axios'

/**
 * Axios instance for calling THIS app's own Next.js API routes
 * (src/app/api/auth/**) — same-origin, cookie-based. This is only for
 * auth, which stays in the frontend repo because it needs httpOnly
 * cookies for SSR session handling (see ARCHITECTURE.md#authentication).
 *
 * Business-domain resources (Goals, and later Competencies/Skills, Raw
 * logs) live in the separate kowabowa-backend repo as Edge Functions —
 * call those through `src/lib/backendApi.ts` instead, which is
 * cross-origin and Bearer-token based rather than cookie-based.
 */
export const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Request failed'
    return Promise.reject(new Error(message))
  }
)

export default api
