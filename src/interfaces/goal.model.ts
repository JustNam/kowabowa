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
  start_date: string
  end_date: string
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
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
}

export interface IGoalCreateRequest {
  title: string
  description?: string
  startDate: string
  endDate: string
}

export interface IGoalCreateDatabaseRequest {
  title: string
  description?: string
  start_date: string
  end_date: string
}
