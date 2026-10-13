export interface IRawLogDatabaseModel {
  id: string
  user_id: string
  goal_id: string
  skill_id: string | null
  title: string
  description: string | null
  is_achievement: boolean
  logged_at: string
  created_at: string
  deleted_at: string | null
  // Nested via PostgREST's foreign-table select, through the goal_id / skill_id
  // foreign keys: `select=*,goals(id,title),skills(id,title)`.
  // Not returned by the `logs` function today (it selects `*` only), hence optional.
  goals?: { id: string; title: string }
  skills?: { id: string; title: string } | null
}

export interface IRawLogModel {
  id: string
  userId: string
  goalId: string
  goalTitle: string | null
  skillId: string | null
  skillTitle: string | null
  title: string
  description: string | null
  isAchievement: boolean
  loggedAt: string
  createdAt: string
  deletedAt: string | null
}

export interface IRawLogCreateRequest {
  title: string
  goalId: string
  loggedAt: string
  description?: string
  skillId?: string
  isAchievement?: boolean
}

export interface IRawLogCreateDatabaseRequest {
  title: string
  goal_id: string
  logged_at: string
  description?: string
  skill_id?: string
  is_achievement?: boolean
}
