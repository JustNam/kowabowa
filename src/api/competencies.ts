import { backendApi } from '@/lib/backendApi'
import { competencyAdapter } from '@/adapters'
import type {
  ICompetencyModel,
  ICompetencyCreateRequest,
  ICompetencyDatabaseModel,
  ICompetencyUpdateRequest,
} from '@/interfaces/competency.model'

export class CompetenciesApi {
  static async list(): Promise<{ data: ICompetencyModel[] }> {
    // const response = await backendApi.get<{ data: ICompetencyDatabaseModel[] }>('/competencies')
    // đổi competencies thành skills do BE đang quy định đây là skills
    const response = await backendApi.get<{ data: ICompetencyDatabaseModel[] }>('/skills')
    return { data: competencyAdapter.listToFrontend(response.data.data) }
  }

  static async create(payload: ICompetencyCreateRequest): Promise<{ data: ICompetencyModel }> {
    const response = await backendApi.post<{ data: ICompetencyDatabaseModel }>(
     // '/competencies',
      '/skills',
      payload
    )
    return { data: competencyAdapter.toFrontend(response.data.data) }
  }

  static async update(payload: ICompetencyUpdateRequest): Promise<{ data: ICompetencyModel }> {
    const response = await backendApi.patch<{ data: ICompetencyDatabaseModel }>(
      '/skills',
      payload
    )
    return { data: competencyAdapter.toFrontend(response.data.data) }
  }

  static async remove(id: string): Promise<void> {
    await backendApi.delete('/skills', { params: {id}})
  }
}
