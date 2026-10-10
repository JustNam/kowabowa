// Backed by the `skills` table. Rows with is_system = true are shared by every
// user and have no owner, so user_id is null for them.
export interface ICompetencyDatabaseModel {
  id: string
  user_id: string | null
  title: string
  description: string | null
  is_system: boolean | null
  created_at: string
}

export interface ICompetencyModel {
  id: string
  userId: string | null
  title: string
  description: string | null
  isSystem: boolean
  createdAt: string
}

export interface ICompetencyCreateRequest {
  title: string
  description?: string
}
