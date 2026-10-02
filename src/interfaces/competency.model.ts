export interface ICompetencyDatabaseModel {
  id: string
  user_id: string
  name: string
  created_at: string
}

export interface ICompetencyModel {
  id: string
  userId: string
  name: string
  createdAt: string
}

export interface ICompetencyCreateRequest {
  name: string
}
