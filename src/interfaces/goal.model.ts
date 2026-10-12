export enum EGoalStatus {
  NOT_STARTED = "not_started",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
}

/** Shape as it comes out of Postgres (snake_case). */
export interface IGoalDatabaseModel {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at?: string;
  logs_count?: number; // chỉ có ở GET /goals (view goal_stats)
  achievements_count?: number;
}

/** Shape used everywhere in the frontend (camelCase). */
export interface IGoalModel {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: EGoalStatus; // tính trong adapter
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt?: string;
  logsCount: number;
  achievementsCount: number;
}

export interface IGoalCreateRequest {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
}

export interface IGoalCreateDatabaseRequest {
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
}

/**
 GET /goals/:id trả {goal, logs, skills}. 
 module Logs/Skills sẽ định nghĩa sau.
 */
export interface IGoalDetailDatabaseModel {
  goal: IGoalDatabaseModel;
  logs: unknown[];
  skills: unknown[];
}
