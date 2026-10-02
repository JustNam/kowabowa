# Kowabowa

Continuous work-achievement tracking, tied directly to performance review.

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full architecture and
[`docs/architecture/DATA_MODEL.md`](./docs/architecture/DATA_MODEL.md) for
the data model.

**This repo is the frontend only.** The database and business-domain API
live in the companion [`kowabowa-backend`](../kowabowa-backend) repo as
Supabase Edge Functions — both deploy into the same Supabase project, as
two codebases rather than one monolith. See
[`ARCHITECTURE.md#two-repos-one-backing-service`](./ARCHITECTURE.md#two-repos-one-backing-service).

## What's built

| Feature              | Status                                       |
| --------------------- | --------------------------------------------- |
| Auth (sign in/up/out, forgot password) | ✅ implemented (this repo) |
| Profile (`public.profiles`) | ✅ implemented (auto-created on signup, no UI yet) |
| Dashboard              | ✅ implemented (empty-state only)              |
| Goals                  | ✅ implemented (split across both repos)        |
| Skills (Competencies)  | ✅ implemented (split across both repos)        |
| Logs (Raw logs)        | ✅ implemented (split across both repos)        |

Every feature follows the same shape — see `src/modules/goals/` +
`src/api/goals.ts` here and `supabase/functions/goals/index.ts` in
`kowabowa-backend` as the reference.

## Getting started

```bash
# 1. In kowabowa-backend (clone it alongside this repo first):
npx supabase start          # requires Docker — prints your local URL/keys
npx supabase db reset       # applies supabase/migrations/
cp .env.example .env        # paste in the printed keys
npx supabase functions serve --env-file .env   # serves every function

# 2. Back in this repo:
npm install
cp .env.local.example .env.local   # paste in the SAME URL/anon key from step 1
npm run dev                         # http://localhost:3000
```

## Scripts

| Command         | What it does            |
| ---------------- | ------------------------- |
| `npm run dev`     | Start the dev server       |
| `npm run build`   | Production build            |
| `npm run start`   | Run the production build    |
| `npm run lint`    | ESLint                      |

## Project structure

See [`ARCHITECTURE.md`](./ARCHITECTURE.md#directory-structure--naming-conventions)
for the full breakdown — short version:

```
src/
  app/        # pages + auth API routes only (src/app/api/auth/**)
  api/        # client-side API service classes
  adapters/   # snake_case <-> camelCase conversion
  atoms/      # Button, Input, Textarea, Select, Modal
  modules/    # feature modules: goals/, competencies/, raw-logs/
  lib/        # axios.ts (auth, cookie-based) + backendApi.ts (Bearer token)
  ...
docs/architecture/
  DATA_MODEL.md
```

The database, migrations, and Edge Functions live in
[`kowabowa-backend`](../kowabowa-backend), not here.
