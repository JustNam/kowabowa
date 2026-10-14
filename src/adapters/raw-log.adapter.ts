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
      skillId: dbData.skill_id,
      skillTitle: dbData.skills?.title ?? null,
      title: dbData.title,
      description: dbData.description,
      isAchievement: dbData.is_achievement,
      loggedAt: dbData.logged_at,
      createdAt: dbData.created_at,
      deletedAt: dbData.deleted_at,
    }
  }

  listToFrontend(dbList: IRawLogDatabaseModel[]): IRawLogModel[] {
    return dbList.map((item) => this.toFrontend(item))
  }

  createRequestToDatabase(frontendData: IRawLogCreateRequest): IRawLogCreateDatabaseRequest {
    const dbData: IRawLogCreateDatabaseRequest = {
      title: frontendData.title,
      goal_id: frontendData.goalId,
      logged_at: frontendData.loggedAt,
    }

    if (frontendData.description) dbData.description = frontendData.description
    if (frontendData.skillId) dbData.skill_id = frontendData.skillId
    if (frontendData.isAchievement !== undefined) dbData.is_achievement = frontendData.isAchievement

    return dbData
  }
}

export const rawLogAdapter = new RawLogAdapter()
