# Project Architecture

## Overview

Kowabowa is a continuous work-achievement tracker tied directly to
performance review. This repo is the **running example** for Product
Iteration with AI — a distilled, teaching-sized version of a real
production codebase (see `docs/architecture/DATA_MODEL.md` for the data
model, and the companion full-scale app for what this grows into).

**This is the frontend.** Business-domain writes (Goals, Competencies/Skills,
Raw logs) go through Supabase Edge Functions reached via
`src/lib/backendApi.ts` (Bearer token), not a route in this repo — that
backend lives in a separate companion repo and is **not actively kept in
sync** with this one (e.g. its `goals` migration still has a single
`target_date` column; this repo's `IGoalModel` has `startDate`/`endDate`).
Treat it as a reference for the Edge Function shape, not a live contract.

Every feature's UI — Goals, Competencies/Skills, Raw logs, Dashboard,
Login, Forgot password, and Onboarding — has been stripped down to
scaffolding + guidance comments for practice (see each file's `TODO`
comment block). What's real and worth studying instead of a single
"reference feature": each feature's data layer (interfaces, adapters,
and API service classes), the shared primitives in `src/atoms/`,
and the TODO comments in the stub you're rebuilding, which name the exact
hooks/API classes to wire up. `auth.users` has a companion `public.profiles` table
(Supabase best practice — see `DATA_MODEL.md` for why) that's written only
by a database trigger, not application code.

---

## Main Technologies

- **Next.js** (App Router)
- **TypeScript** (strict mode, interfaces for all data)
- **TailwindCSS** (utility-first styling for one-off layout)
- **MUI** (Material UI — component library backing `src/atoms/`)
- **Supabase** (Postgres, Auth)
- **Axios** (HTTP requests to our own API routes)

Deliberately **not** included yet, even though the full production app
uses them — each earns its place in a later lesson instead of being
cargo-culted in on day one:

- A global state library (RxJS, Zustand, etc.) — React's `useState` +
  Context is enough for one feature. Reach for one when prop-drilling
  actually hurts, not before.
- Testing/Storybook tooling — added once there's enough surface area to
  justify it (no `e2e/` directory yet).

---

## The 3-Layer Architecture

Every feature crosses the same three layers, in the same direction:
**Client (UI + hooks) → API layer → Supabase.**

- **Client**: React components. Never talk to Supabase directly for
  anything that mutates data.
- **API layer** — two different paths depending on the feature:
  - Business-domain resources (Goals, Competencies/Skills, Raw logs) go
    through `src/lib/backendApi.ts`, which attaches the signed-in user's
    session as `Authorization: Bearer <token>` and calls a Supabase Edge
    Function in the companion backend repo.
  - Auth (sign in/up/out) goes through this repo's own
    `src/app/api/auth/**` Next.js routes instead, because establishing a
    session needs to set httpOnly cookies, which only this app's own
    server can do.
- **Supabase**: Postgres + Auth, the source of truth either way.

This is why `GoalsApi.create()` doesn't call Supabase directly — it POSTs
through `backendApi`, and no code in this repo ever touches
`supabase.from('goals')`.

---

## Directory Structure & Naming Conventions

```
src/
  app/           # Next.js App Router — pages (src/app/<feature>/) and
                 # auth API routes ONLY (src/app/api/auth/**)
  api/           # Client-side API service classes (e.g. goals.ts)
  adapters/      # snake_case (DB) <-> camelCase (frontend) conversion
  atoms/         # Pure UI primitives, no business logic (button/, input/,
                 # textarea/, select/, modal/, date-picker/) — themed MUI wrappers
  components/    # App-wide components that DO hold logic/state (AuthProvider:
                 # auth context, Sidebar: nav + auth-aware rendering, PageLayout: shell)
  modules/       # Feature modules — UI + schema, one folder per feature
  hooks/         # Custom hooks (useAuth.ts)
  lib/           # External library config (supabase/, mui/, axios.ts, backendApi.ts)
  interfaces/    # TypeScript interfaces/models
  constants/     # Route constants, enums
  config/        # Environment configuration
  middleware.ts  # Auth-based route protection
docs/
  architecture/  # DATA_MODEL.md and friends
```

No `supabase/` directory here — the DB schema and Edge Functions live in
the separate companion backend repo (see Overview above for why that's
not a live contract).

**Conventions:**

- Folders: lowercase, dashes for multi-word (`raw-logs/`, not `rawLogs/`).
- Files: camelCase; PascalCase for component files that export a
  component as their default/primary export.
- Interfaces: prefix `I` (`IGoalModel`). Enums: prefix `E` (`EGoalStatus`).
- Constants: `UPPER_SNAKE_CASE`.

| Entity    | Convention         | Example            |
| --------- | ------------------- | -------------------- |
| Component | PascalCase           | `GoalsList`           |
| Hook      | camelCase, `use*`     | `useAuth.ts`          |
| Interface | prefix `I`            | `IGoalModel`          |
| Enum      | prefix `E`            | `EGoalStatus`         |
| Constant  | `UPPER_SNAKE_CASE`    | `ROUTES`              |
| API class | PascalCase + `Api`    | `GoalsApi`            |
| Adapter   | PascalCase + `Adapter`| `GoalAdapter`         |

---

## Example: Feature Module Structure

```
src/modules/raw-logs/
  components/
    list/index.tsx      # RawLogsApi.list(goalId?) -> GET raw-logs; renders the Create modal
    create/index.tsx     # Modal (open/onClose/onCreated/defaultGoalId), RawLogsApi.create()
```

Goals also needs a `detail/` sub-component (`GoalsDetail`) once rebuilt;
raw-logs doesn't have one since logs don't get their own page.

---

## State Management

- **Server state** (data from Supabase): fetched inside each component
  with `useEffect` + the relevant `*Api` class, held in local `useState`.
  No caching layer yet — if you find yourself re-fetching the same data
  in five places, that's the signal to introduce one (React Query is the
  natural next step, not RxJS).
- **Auth state**: lives in `src/hooks/useAuth.ts`, exposed app-wide via
  React Context in `src/components/AuthProvider.tsx`.

```tsx
// Usage in any client component
import { useAuth } from '@/components/AuthProvider'
const { user, signIn, signOut } = useAuth()
```

`AuthProvider` wraps the whole app in `src/app/layout.tsx` — add new
app-wide providers there, feature-local state stays inside the feature's
own module folder instead.

---

## Authentication

Supabase Auth with SSR cookie-based sessions — this part is entirely
within this repo.

- `src/lib/supabase/client.ts` — browser client (Client Components).
- `src/lib/supabase/server.ts` — server client (Server Components, route
  handlers).
- `src/middleware.ts` — redirects unauthenticated users to `/login`,
  refreshes the session cookie on every request.
- `src/app/api/auth/{signin,signup,signout}/route.ts` — the only code
  that calls `supabase.auth.*` for writes; the client goes through these.

**Reaching the business-domain backend with that session**: Edge
Functions are a different origin and never see this app's cookies, so
`src/lib/backendApi.ts` reads the current Supabase session client-side and
attaches it as `Authorization: Bearer <access_token>` on every request —
cookies authenticate you to *this* app, the bearer token authenticates
you to the backend.

---

## Environment Configuration

- Centralized in `src/config/environment.ts` — `import { env } from
'@/config/environment'`.
- `.env.local` overrides everything else and is gitignored. Copy
  `.env.local.example` to get started with a local `supabase start`.
- Never commit real secrets — only `.env.example` / `.env.local.example`
  with placeholders.

---

## API/Data Fetching

### Client-side API services (`src/api/`)

One class per feature, static methods — never Supabase directly, never a
bare `fetch()` in a component. Two different HTTP clients underneath,
depending on where the feature's logic lives:

```ts
// src/api/goals.ts — business-domain resource, calls the Edge Function backend
import { backendApi } from '@/lib/backendApi'

export class GoalsApi {
  static async list(): Promise<{ data: IGoalModel[] }> {
    const response = await backendApi.get('/goals')
    return { data: goalAdapter.listToFrontend(response.data.data) }
  }
  // create(), detail() follow the same shape
}
```

```ts
// src/api/auth.ts — auth, calls this repo's own Next.js route
import { api } from '@/lib/axios'

export class AuthApi {
  static async signIn(email: string, password: string) {
    return api.post('/api/auth/signin', { email, password })
  }
}
```

### This repo's own API routes (`src/app/api/auth/`)

Next.js Route Handlers, auth-only. Authenticate via `createClient()` from
`src/lib/supabase/server.ts`.

---

## Routing

Centralized, type-safe constants in `src/constants/routes.ts` — never a
hardcoded string in a `<Link>` or `router.push()`.

**Pattern** (same for every feature):

- List: `/{feature}/list`
- Detail: `/{feature}/{id}`
- Create: a **modal** (`src/atoms/modal`), not a route — see Goals below.
  `/{feature}/create` is only worth a real page once a create flow needs
  more room than a modal can give it (multi-step, heavy content, etc.).

```ts
router.push(ROUTES.GOALS.LIST)
router.push(ROUTES.GOALS.DETAIL(goalId))
```

`src/middleware.ts` handles the auth-based redirects (unauthenticated →
`/login`, authenticated hitting `/login` → `ROUTES.POST_LOGIN_REDIRECT`,
currently `/dashboard`). New users land on `/onboarding` right after
signup instead (see `src/app/onboarding/page.tsx`).

---

## Styling

- Shared visual primitives (buttons, inputs, textareas, selects, modals,
  the date picker) are themed MUI components, wrapped in `src/atoms/` —
  see `src/lib/mui/theme.ts` for the project's palette/shape tokens and
  `src/lib/mui/ThemeRegistry.tsx` for the Next.js App Router SSR
  integration (Emotion cache + `ThemeProvider`, wired into
  `src/app/layout.tsx`).
- TailwindCSS utility classes are still used directly in JSX for one-off
  layout in feature code (flex/grid, spacing, etc.) — they're not used to
  build new shared primitives; reach for an existing atom (or MUI
  directly, themed) for that instead. No SCSS modules, no other
  CSS-in-JS.

---

## Best Practices

- Keep components small; one responsibility each.
- Never call Supabase from a Client Component for anything that writes data.
- Don't introduce a library (state manager, component kit, test runner)
  before the problem it solves actually shows up in this codebase.
- When in doubt, read the stub's `TODO` comment block and the feature's
  data layer (interface/adapter/API service) for the shape to build
  toward.

---

## What's intentionally not here yet

Don't build ahead of these — they're left as-is on purpose:

- Goals, Competencies/Skills, Raw logs, Dashboard, Login, Forgot
  password, and Onboarding — stripped down to scaffolding + guidance
  comments for practice. Each stub's own `TODO` comment block names the
  data layer (interface/adapter/API service) to wire up.
- Achievements (see `docs/architecture/DATA_MODEL.md`) — explicitly out
  of scope, not a gap to fill.
- Goal edit/delete, status-change UI.
- Design/Plan/Implement/Test/Document loop.
- Playwright e2e coverage.
- Auth hardening, RBAC, secrets handling.

See `docs/architecture/DATA_MODEL.md` for the full data model.
