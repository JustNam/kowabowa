# Kowabowa

Continuous work-achievement tracking, tied directly to performance review.

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full architecture and
[`docs/architecture/DATA_MODEL.md`](./docs/architecture/DATA_MODEL.md) for
the data model.

**This repo is the frontend only.** Business-domain writes (Goals,
Competencies/Skills, Raw logs) go through Supabase Edge Functions in a
companion [`kowabowa-backend`](../kowabowa-backend) repo, reached via
`src/lib/backendApi.ts` — see [`ARCHITECTURE.md`](./ARCHITECTURE.md) for
how. That backend repo is **not actively kept in sync** with this one
(known drift: its `goals` migration still has one `target_date` column,
this repo's `IGoalModel` has `startDate`/`endDate`), so treat it as a
reference, not a live contract.

## What's built

| Feature              | Status                                       |
| --------------------- | --------------------------------------------- |
| Auth (sign in/up/out, forgot password) | 🔲 scaffolded — practice exercise, see `ARCHITECTURE.md` |
| Profile (`public.profiles`) | ✅ implemented (auto-created on signup, no UI yet) |
| Dashboard              | 🔲 scaffolded — practice exercise              |
| Onboarding             | 🔲 scaffolded — practice exercise              |
| Goals                  | 🔲 scaffolded — practice exercise (data layer — interface/adapter/API — is real, UI is a stub) |
| Skills (Competencies)  | 🔲 scaffolded — practice exercise (same split as Goals) |
| Logs (Raw logs)        | 🔲 scaffolded — practice exercise, data layer is real |

Every feature follows the same shape — see each feature's data layer
(`src/interfaces/`, `src/adapters/`, `src/api/`) and the TODO comments in
each stub for the conventions. All feature UIs have been intentionally
stripped down to scaffolding + guidance comments for practice; each
feature's data layer (interface/adapter/API service) is real and
functional.

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

Note: `kowabowa-backend` isn't kept in sync with this repo's schema —
e.g. creating a Goal here will send `startDate`/`endDate`, but its
migration still only has `target_date`. Expect to patch the backend
locally if you want Goals to round-trip for real.

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
  atoms/      # Button, Input, Textarea, Select, Modal, DatePicker
  modules/    # feature modules: goals/, competencies/, raw-logs/
  lib/        # axios.ts (auth, cookie-based) + backendApi.ts (Bearer token)
  ...
docs/architecture/
  DATA_MODEL.md
```

The database, migrations, and Edge Functions live in
[`kowabowa-backend`](../kowabowa-backend), not here (and, per the drift
note above, aren't kept in sync with it).
