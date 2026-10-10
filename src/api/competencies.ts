import { backendApi } from '@/lib/backendApi'
import { competencyAdapter } from '@/adapters'
import type {
  ICompetencyModel,
  ICompetencyCreateRequest,
  ICompetencyDatabaseModel,
} from '@/interfaces/competency.model'

// The backend function is `skills` (table `skills`); "competency" is the
// frontend's name for the same entity.
export class CompetenciesApi {
  /** The user's own skills plus the shared system skills. */
  static async list(): Promise<{ data: ICompetencyModel[] }> {
    const response = await backendApi.get<{ data: ICompetencyDatabaseModel[] }>('/skills')
    return { data: competencyAdapter.listToFrontend(response.data.data) }
  }

  static async create(payload: ICompetencyCreateRequest): Promise<{ data: ICompetencyModel }> {
    const response = await backendApi.post<{ data: ICompetencyDatabaseModel }>('/skills', payload)
    return { data: competencyAdapter.toFrontend(response.data.data) }
  }
}
