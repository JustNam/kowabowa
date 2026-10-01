export enum EGoalStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

/** Shape as it comes out of Postgres (snake_case). */
export interface IGoalDatabaseModel {
  id: string
  user_id: string
  title: string
  description: string | null
  status: EGoalStatus
  target_date: string | null
  created_at: string
  updated_at: string
}

/** Shape used everywhere in the frontend (camelCase). */
export interface IGoalModel {
  id: string
  userId: string
  title: string
  description: string | null
  status: EGoalStatus
  targetDate: string | null
  createdAt: string
  updatedAt: string
}

export interface IGoalCreateRequest {
  title: string
  description?: string
  targetDate?: string
}

export interface IGoalCreateDatabaseRequest {
  title: string
  description?: string
  target_date?: string
}
