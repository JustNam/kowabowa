# Project Architecture

## Overview

Kowabowa is a continuous work-achievement tracker tied directly to
performance review. This repo is the **running example** for Product
Iteration with AI — a distilled, teaching-sized version of a real
production codebase (see `docs/architecture/DATA_MODEL.md` for the data
model, and the companion full-scale app for what this grows into).

**This is the frontend.** The database schema and business-domain API
(everything except auth) live in a separate companion repo,
[`kowabowa-backend`](../kowabowa-backend), as Supabase Edge Functions.
Both repos deploy into the *same* Supabase project — it's one backing
service split across two codebases, not two servers. See
[Two Repos, One Backing Service](#two-repos-one-backing-service) below.

Goals, Competencies/Skills, and Raw logs are all implemented end to end,
each following the same shape — see `docs/architecture/DATA_MODEL.md` and
`kowabowa-backend`'s `CLAUDE.md` for the pattern. `auth.users` has a
companion `public.profiles` table (Supabase best practice — see
DATA_MODEL.md for why) that's written only by a database trigger, not
application code.

---

## Main Technologies

- **Next.js** (App Router)
- **TypeScript** (strict mode, interfaces for all data)
- **TailwindCSS** (utility-first styling, no component library)
- **Supabase** (Postgres, Auth)
- **Axios** (HTTP requests to our own API routes)
- **Yup** (form validation)

Deliberately **not** included yet, even though the full production app
uses them — each earns its place in a later lesson instead of being
cargo-culted in on day one:

- A global state library (RxJS, Zustand, etc.) — React's `useState` +
  Context is enough for one feature. Reach for one when prop-drilling
  actually hurts, not before.
- A component library (MUI, shadcn/ui) — plain Tailwind + a few atoms
  keeps "what does this render as HTML" legible while you're still
  learning the DOM/CSS layer underneath any library.
- Testing/Storybook tooling — see `e2e/README.md`; added once there's
  enough surface area to justify it.

---

## The 3-Layer Architecture

Every feature in this app crosses the same three layers, in the same
direction, always. The middle layer splits across the two repos:

```
┌─────────────┐      ┌───────────────────────┐      ┌────────────┐
│   Client     │ ───▶ │  Business-domain API    │ ───▶ │  Supabase   │
│ (UI + hooks) │ ◀─── │  (kowabowa-backend,      │ ◀─── │ (Postgres)  │
│              │      │   Edge Functions)         │      │             │
└─────────────┘      └───────────────────────┘      └────────────┘
     camelCase          Bearer token · snake_case        snake_case

┌─────────────┐      ┌──────────────────┐
│   Client     │ ───▶ │  Auth API route    │ ──▶ Supabase Auth (cookies)
│ (UI + hooks) │ ◀─── │  (src/app/api/auth) │
└─────────────┘      └──────────────────┘
```

- **Client**: React components. Never talk to Supabase directly for
  anything that mutates data — always go through an API layer, so auth
  checks and validation live in exactly one place.
- **Business-domain API** (`kowabowa-backend`, separate repo): Edge
  Functions are the trust boundary for Goals (and, once you build them,
  Competencies/Skills and Raw logs). Each one forwards the caller's
  Bearer token into its Supabase client so `auth.getUser()` resolves the
  real caller, then explicitly filters every query by `user_id` — **not**
  Postgres Row Level Security, which is deliberately off for now
  (see `kowabowa-backend/CLAUDE.md#auth-model`).
- **Auth API route** (`src/app/api/auth/**`, *this* repo): the one piece
  of "backend" that stays in the frontend, because signing in/up/out needs
  to set httpOnly cookies for Next.js SSR — something an Edge Function,
  reached cross-origin, can't do for this app.
- **Supabase**: Postgres, shared by both paths above.

This is why `GoalsApi.create()` doesn't call Supabase directly — it POSTs
to the `goals` Edge Function in `kowabowa-backend`, which is the only
thing that touches `supabase.from('goals')`.

## Two Repos, One Backing Service

| | `kowabowa` (this repo) | `kowabowa-backend` |
| --- | --- | --- |
| Owns | UI, routing, auth cookies | DB schema, business-domain API |
| Deploys as | Next.js app (e.g. Vercel) | Supabase Edge Functions |
| Talks to Postgres via | Supabase Auth only | Every table except `auth.users` |
| Called with | — | Bearer token (`Authorization` header) |

Both point at the same Supabase project (same `NEXT_PUBLIC_SUPABASE_URL`).
Running everything locally means: `supabase start` once, from
`kowabowa-backend` (it owns `supabase/migrations/` and `supabase/config.toml`),
then `npm run dev` here with `.env.local` pointed at that same instance.

---

## Directory Structure & Naming Conventions

```
src/
  app/           # Next.js App Router — pages (src/app/<feature>/) and
                 # auth API routes ONLY (src/app/api/auth/**)
  api/           # Client-side API service classes (e.g. goals.ts)
  adapters/      # snake_case (DB) <-> camelCase (frontend) conversion
  atoms/         # Pure, reusable UI primitives (button/, input/, modal/)
  components/    # App-wide React components (AuthProvider, PageLayout)
  modules/       # Feature modules — UI + schema, one folder per feature
  hooks/         # Custom hooks (useAuth.ts)
  lib/           # External library config (supabase/, axios.ts, backendApi.ts)
  interfaces/    # TypeScript interfaces/models
  constants/     # Route constants, enums
  config/        # Environment configuration
  middleware.ts  # Auth-based route protection
docs/
  architecture/  # DATA_MODEL.md and friends
e2e/             # Playwright specs (added later — see e2e/README.md)
```

`supabase/migrations/` and `supabase/functions/` live in the companion
[`kowabowa-backend`](../kowabowa-backend) repo, not here.

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
src/modules/goals/
  components/
    list/index.tsx      # GoalsApi.list() -> GET goals (kowabowa-backend); renders the Modal below
    create/index.tsx     # Modal (open/onClose/onCreated props), Yup-validated, GoalsApi.create()
    detail/index.tsx     # GoalsApi.detail(id) -> GET goals/:id
  schema.ts              # Yup validation schema for the create form
```

Every feature you add (Competencies/Skills, Raw logs) should look exactly
like this — same three sub-components, same `schema.ts`. `create/` is a
modal rendered by `list/`, not a page — no `src/app/<feature>/create/`.

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
within this repo, unlike Goals/Competencies/Raw-logs.

- `src/lib/supabase/client.ts` — browser client (Client Components).
- `src/lib/supabase/server.ts` — server client (Server Components, route
  handlers).
- `src/middleware.ts` — redirects unauthenticated users to `/login`,
  refreshes the session cookie on every request.
- `src/app/api/auth/{signin,signup,signout}/route.ts` — the only code
  that calls `supabase.auth.*` for writes; the client goes through these.

**Reaching `kowabowa-backend` with that session**: Edge Functions are a
different origin and never see this app's cookies, so
`src/lib/backendApi.ts` reads the current Supabase session client-side and
attaches it as `Authorization: Bearer <access_token>` on every request.
The Edge Function forwards that same header into its own Supabase client
so `auth.getUser()` resolves the signed-in user — cookies authenticate you
to *this* app, the bearer token authenticates you to the *backend*. That
token does **not** currently gate which rows a query can touch, though —
see `kowabowa-backend/CLAUDE.md#auth-model` for why (no RLS yet).

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
// src/api/goals.ts — business-domain resource, calls kowabowa-backend
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

### The business-domain API (`kowabowa-backend`)

Not in this repo. One Supabase Edge Function per resource
(`supabase/functions/goals/index.ts` there), each scoped to `user.id` by
the function's own query filters — RLS isn't wired up yet. See that repo's
`CLAUDE.md` before adding Competencies/Skills or Raw logs.

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
currently `/dashboard`).

Full page/modal inventory — including screens not built yet — lives in
`docs/architecture/PAGE_INVENTORY.md`.

---

## Styling

- TailwindCSS utility classes directly in JSX. No SCSS modules, no CSS-in-JS.
- Shared primitives live in `src/atoms/` as thin wrappers that accept
  `className` and merge it with `clsx` — compose Tailwind, don't fight it.

---

## Validation

Yup schemas, colocated with the feature that uses them
(`src/modules/<feature>/schema.ts`), validated on submit before any
network call is made.

---

## Best Practices

- Keep components small; one responsibility each.
- Never call Supabase from a Client Component for anything that writes data.
- Don't introduce a library (state manager, component kit, test runner)
  before the problem it solves actually shows up in this codebase.
- When in doubt, open `src/modules/goals/` here and
  `supabase/functions/goals/` in `kowabowa-backend`, and copy the shape —
  that's what they're there for.

---

## What's intentionally not here yet

Don't build ahead of these — they're left as-is on purpose:

- `competencies` / `raw_logs` functions + UI
- Design/Plan/Implement/Test/Document loop
- Playwright e2e coverage
- Row Level Security on `public.goals`
- Auth hardening, RBAC, secrets handling
- Locking down `kowabowa-backend`'s wildcard CORS

See `docs/architecture/DATA_MODEL.md` for the full data model.
