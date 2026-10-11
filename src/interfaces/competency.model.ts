export interface ICompetencyDatabaseModel {
  id: string
  user_id: string
  title: string
  // name: string
  created_at: string
}

export interface ICompetencyModel {
  id: string
  userId: string
  // name: string
  title: string
  createdAt: string
}

export interface ICompetencyCreateRequest {
  // name: string
  title: string
}
