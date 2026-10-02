import { competencyAdapter } from './competency.adapter'
import type {
  IRawLogDatabaseModel,
  IRawLogModel,
  IRawLogCreateRequest,
  IRawLogCreateDatabaseRequest,
} from '@/interfaces/raw-log.model'

export class RawLogAdapter {
  toFrontend(dbData: IRawLogDatabaseModel): IRawLogModel {
    return {
      id: dbData.id,
      userId: dbData.user_id,
      goalId: dbData.goal_id,
      goalTitle: dbData.goals?.title ?? null,
      description: dbData.description,
      loggedAt: dbData.logged_at,
      createdAt: dbData.created_at,
      competencies: (dbData.raw_log_competencies ?? [])
        .map((join) => join.competencies)
        .filter((c): c is NonNullable<typeof c> => c !== null)
        .map((c) => competencyAdapter.toFrontend(c)),
    }
  }

  listToFrontend(dbList: IRawLogDatabaseModel[]): IRawLogModel[] {
    return dbList.map((item) => this.toFrontend(item))
  }

  createRequestToDatabase(frontendData: IRawLogCreateRequest): IRawLogCreateDatabaseRequest {
    const dbData: IRawLogCreateDatabaseRequest = {
      goal_id: frontendData.goalId,
      description: frontendData.description,
      competency_ids: frontendData.competencyIds,
    }

    if (frontendData.loggedAt) {
      dbData.logged_at = frontendData.loggedAt
    }

    return dbData
  }
}

export const rawLogAdapter = new RawLogAdapter()
