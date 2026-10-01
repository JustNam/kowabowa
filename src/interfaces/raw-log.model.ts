/**
 * NOT IMPLEMENTED YET.
 *
 * There is no `raw_logs` table in supabase/migrations yet. This interface
 * is a placeholder so the shape of the data model is visible from day one
 * — your job is to:
 *   1. Design the `raw_logs` table (see docs/architecture/DATA_MODEL.md).
 *      A raw log belongs to a User, links back to exactly one Goal, and
 *      references one or more Competencies/Skills it provides evidence for.
 *   2. Write the migration.
 *   3. Flesh this interface out, then build the adapter + API + UI
 *      following the exact pattern used for Goals in this codebase.
 */
export interface IRawLogModel {
  id: string
  userId: string
  goalId: string
}
