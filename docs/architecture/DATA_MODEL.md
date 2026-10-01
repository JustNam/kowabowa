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

A **raw log** is the atomic unit: one entry capturing a piece of work,
timestamped, linked to the goal it advances and the skill(s) it
demonstrates. Goals and competencies are the two lenses used to aggregate
raw logs later (progress-toward-a-goal view vs. skill-growth-over-time
view) — which is exactly the shape a performance review needs.

## Implementation status

| Entity                | Table              | Migration                                            | Status                                   |
| ---------------------- | ------------------ | ----------------------------------------------------- | ----------------------------------------- |
| User                    | `auth.users`        | managed by Supabase Auth                                | ✅ built-in                                |
| Goal                    | `public.goals`      | `kowabowa-backend/supabase/migrations/20260101000000_create_goals_table.sql` | ✅ implemented — the reference slice        |
| Competencies/Skills     | *(none yet)*        | —                                                      | 🔲 **your exercise**            |
| Raw logs                | *(none yet)*        | —                                                      | 🔲 **your exercise**            |

`src/interfaces/competency.model.ts` and `src/interfaces/raw-log.model.ts`
exist as placeholders so the target shape is visible, but they're
intentionally incomplete — flesh them out once you've designed the tables.

## Building Competencies/Skills and Raw logs

Follow the exact pattern `goals` already demonstrates, end to end — split
across **both** repos:

In `kowabowa-backend`:
1. **Migration** (`supabase/migrations/`): table with a `user_id` column.
   No RLS yet — see `kowabowa-backend/CLAUDE.md#auth-model` for why that's
   deliberate, and don't add policies yet.
2. **Edge Function** (`supabase/functions/<entity>/index.ts`): GET list + GET `:id` + POST create, same method/path-dispatch shape as `goals/index.ts`.

In `kowabowa` (this repo):
3. **Interface** (`src/interfaces/`): `I<Entity>DatabaseModel` (snake_case) and `I<Entity>Model` (camelCase).
4. **Adapter** (`src/adapters/`): `toFrontend` / `toDatabase` / list variants.
5. **API service** (`src/api/`): a `<Entity>Api` class calling `backendApi` — never fetch()/Supabase directly from components.
6. **Feature module** (`src/modules/<entity>/`): list/create/detail components + a Yup schema.
7. **Routes** (`src/constants/routes.ts`): add the `<ENTITY>` group.
8. **Pages** (`src/app/<entity>/`): wire the module components into `list/`, `create/`, `[id]/`.

Raw logs are the trickier one: they reference **two** foreign keys (a goal
and at least one competency), so think through the join before writing SQL.
