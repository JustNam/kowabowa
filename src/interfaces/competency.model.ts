export interface ICompetencyDatabaseModel {
  id: string
  user_id: string
  title: string
  // name: string
  created_at: string
  is_system: boolean
}

export interface ICompetencyModel {
  id: string
  userId: string
  // name: string
  title: string
  createdAt: string
  isSystem: boolean
}

export interface ICompetencyCreateRequest {
  // name: string
  title: string
  // khong bat buoc gui
  description?: string
}
