import { backendApi } from '@/lib/backendApi'
import { competencyAdapter } from '@/adapters'
import type {
  ICompetencyModel,
  ICompetencyCreateRequest,
  ICompetencyDatabaseModel,
} from '@/interfaces/competency.model'

export class CompetenciesApi {
  static async list(): Promise<{ data: ICompetencyModel[] }> {
    const response = await backendApi.get<{ data: ICompetencyDatabaseModel[] }>('/competencies')
    return { data: competencyAdapter.listToFrontend(response.data.data) }
  }

  static async create(payload: ICompetencyCreateRequest): Promise<{ data: ICompetencyModel }> {
    const response = await backendApi.post<{ data: ICompetencyDatabaseModel }>(
      '/competencies',
      payload
    )
    return { data: competencyAdapter.toFrontend(response.data.data) }
  }
}
