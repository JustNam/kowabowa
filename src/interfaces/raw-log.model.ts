import type { ICompetencyDatabaseModel, ICompetencyModel } from './competency.model'

export interface IRawLogDatabaseModel {
  id: string
  user_id: string
  goal_id: string
  description: string
  logged_at: string
  created_at: string
  // Nested via Supabase's foreign-table select — see
  // kowabowa-backend/supabase/functions/raw-logs/index.ts#SELECT_WITH_RELATIONS.
  goals: { id: string; title: string } | null
  raw_log_competencies: { competency_id: string; competencies: ICompetencyDatabaseModel | null }[]
}

export interface IRawLogModel {
  id: string
  userId: string
  goalId: string
  goalTitle: string | null
  description: string
  loggedAt: string
  createdAt: string
  competencies: ICompetencyModel[]
}

export interface IRawLogCreateRequest {
  goalId: string
  description: string
  loggedAt?: string
  competencyIds: string[]
}

export interface IRawLogCreateDatabaseRequest {
  goal_id: string
  description: string
  logged_at?: string
  competency_ids: string[]
}
