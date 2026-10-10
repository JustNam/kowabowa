import { backendApi } from '@/lib/backendApi'
import { rawLogAdapter } from '@/adapters'
import type {
  IRawLogModel,
  IRawLogCreateRequest,
  IRawLogDatabaseModel,
} from '@/interfaces/raw-log.model'

export class RawLogsApi {
  /** Omit goalId to fetch every log for the current user. */
  static async list(goalId?: string): Promise<{ data: IRawLogModel[] }> {
    const response = await backendApi.get<{ logs: IRawLogDatabaseModel[] }>('/logs', {
      params: goalId ? { goal_id: goalId } : undefined,
    })
    return { data: rawLogAdapter.listToFrontend(response.data.logs) }
  }

  static async create(payload: IRawLogCreateRequest): Promise<{ data: IRawLogModel }> {
    const dbPayload = rawLogAdapter.createRequestToDatabase(payload)
    const response = await backendApi.post<{ log: IRawLogDatabaseModel }>('/logs', dbPayload)
    return { data: rawLogAdapter.toFrontend(response.data.log) }
  }
}
