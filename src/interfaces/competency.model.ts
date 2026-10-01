/**
 * NOT IMPLEMENTED YET.
 *
 * There is no `competencies` table in supabase/migrations yet. This
 * interface is a placeholder so the shape of the data model is visible
 * from day one — your job is to:
 *   1. Design the `competencies` table (see docs/architecture/DATA_MODEL.md
 *      for the required relationships: User 1-n Competencies/Skills,
 *      Raw logs 1-n Competencies/Skills).
 *   2. Write the migration.
 *   3. Flesh this interface out, then build the adapter + API + UI
 *      following the exact pattern used for Goals in this codebase.
 */
export interface ICompetencyModel {
  id: string
  userId: string
  name: string
}
