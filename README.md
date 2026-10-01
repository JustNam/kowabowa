# Kowabowa

Continuous work-achievement tracking, tied directly to performance review.

This is the **running example** for Product Iteration with AI — built up
incrementally as the course progresses. See [`ARCHITECTURE.md`](./ARCHITECTURE.md)
for the full architecture and [`docs/architecture/DATA_MODEL.md`](./docs/architecture/DATA_MODEL.md)
for the data model.

**This repo is the frontend only.** The database and business-domain API
live in the companion [`kowabowa-backend`](../kowabowa-backend) repo as
Supabase Edge Functions — both deploy into the same Supabase project, as
two codebases rather than one monolith. See
[`ARCHITECTURE.md#two-repos-one-backing-service`](./ARCHITECTURE.md#two-repos-one-backing-service).

## What's built vs. what's your exercise

| Feature              | Status                                       |
| --------------------- | --------------------------------------------- |
| Auth (sign in/up/out)  | ✅ implemented (this repo)                      |
| Goals                  | ✅ implemented — **the pattern to copy** (split across both repos) |
| Competencies/Skills    | 🔲 your exercise                                   |
| Raw logs               | 🔲 your exercise                                   |

Before touching Competencies/Skills or Raw logs, read `src/modules/goals/`
+ `src/api/goals.ts` here, and `supabase/functions/goals/index.ts` in
`kowabowa-backend`, end to end — every new feature should look like that one.

## Getting started

```bash
# 1. In kowabowa-backend (clone it alongside this repo first):
npx supabase start          # requires Docker — prints your local URL/keys
npx supabase db reset       # applies supabase/migrations/
cp .env.example .env        # paste in the printed keys
npx supabase functions serve goals --env-file .env

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
  atoms/      # Button, Input, Textarea
  modules/    # feature modules (goals/ is the only one so far)
  lib/        # axios.ts (auth, cookie-based) + backendApi.ts (Bearer token)
  ...
docs/architecture/
  DATA_MODEL.md
```

The database, migrations, and the `goals` Edge Function live in
[`kowabowa-backend`](../kowabowa-backend), not here.
