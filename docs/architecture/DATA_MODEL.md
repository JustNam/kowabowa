# Data Model

Kowabowa tracks continuous work achievement, tied directly to performance
review. Four entities, four relationships — on purpose. Per the Final
Project scoping rule, a real product's schema should land around 5-10
tables; this is the conceptual core you'll expand from.

```
                    User
                   /    \
            1-n   /      \  1-n
                 /        \
      Competencies/Skills  Goal
                 \        /
            1-n   \      /  1-n
                   \    /
                 Raw logs
```

| Relationship                        | Cardinality | Meaning                                                  |
| ------------------------------------ | ----------- | --------------------------------------------------------- |
| User → Goal                          | 1-n         | A user sets many goals over time.                          |
| User → Competencies/Skills           | 1-n         | A user has many tracked skills/competencies.                |
| User → Raw logs                      | 1-n         | A user produces many raw logs (one per piece of work).       |
| Goal → Raw logs                      | 1-n         | A goal accumulates evidence over time via raw logs.           |
| Raw logs → Competencies/Skills       | 1-n         | A raw log can be evidence for one or more skills.           |
| User → Profile                       | 1-1         | Supabase-managed identity vs. the app-owned data about them. |

A **raw log** is the atomic unit: one entry capturing a piece of work,
timestamped, linked to the goal it advances and the skill(s) it
demonstrates. Goals and competencies are the two lenses used to aggregate
raw logs later (progress-toward-a-goal view vs. skill-growth-over-time
view) — which is exactly the shape a performance review needs.

**Why `profiles` is separate from `auth.users`**: Supabase owns the
`auth.users` schema — you don't add columns to it or write to it directly
from application code. `public.profiles` is the standard companion table
for anything your app needs to own about a user (display name, avatar,
later: role, preferences). A trigger (`on_auth_user_created`) inserts the
matching row the moment someone signs up, so the two stay in sync without
the frontend ever managing it. `goals.user_id` etc. still reference
`auth.users.id` directly (that's the stable identity key); `profiles.id`
is the same value, just the row your app actually joins against.

## Implementation status

| Entity                | Table                        | Migration (`kowabowa-backend`)                                    | Status |
| ---------------------- | ----------------------------- | -------------------------------------------------------------------- | ------- |
| User                    | `auth.users`                  | managed by Supabase Auth                                              | ✅ built-in |
| Profile                 | `public.profiles`             | `supabase/migrations/20260100000000_create_profiles_table.sql`        | ✅ implemented — auto-created via `on_auth_user_created` trigger |
| Goal                    | `public.goals`                | `supabase/migrations/20260101000000_create_goals_table.sql`           | ✅ implemented |
| Competencies/Skills     | `public.competencies`         | `supabase/migrations/20260102000000_create_competencies_table.sql`    | ✅ implemented |
| Raw logs                | `public.raw_logs` + `public.raw_log_competencies` (join table) | `supabase/migrations/20260103000000_create_raw_logs_table.sql` | ✅ implemented |

Every entity follows the same shape across both repos:

- `kowabowa-backend`: migration (table + `user_id` column; no RLS yet —
  see `kowabowa-backend/CLAUDE.md#auth-model`), Edge Function
  (`supabase/functions/<entity>/index.ts`).
- `kowabowa`: interface (`src/interfaces/`), adapter (`src/adapters/`),
  API service (`src/api/`), feature module (`src/modules/<entity>/`),
  routes (`src/constants/routes.ts`), pages (`src/app/<entity>/`).

`profiles` is the one exception — it's written only by the database
trigger, never by application code, so it has no Edge Function, adapter,
or page yet. `src/interfaces/profile.model.ts` documents its shape for
whenever a "your account" page needs it.

Raw logs is the one with a real join: it references **two** relationships
— exactly one Goal (`goal_id` FK) and one-or-more Competencies/Skills
(`raw_log_competencies` join table) — see
`kowabowa-backend/supabase/functions/raw-logs/index.ts` for how the
Edge Function inserts the join rows and nests the related data back out
in one `select()`.
