import type { IAdapterWithList } from '@/interfaces/adapter.model'
import type {
  IGoalDatabaseModel,
  IGoalModel,
  IGoalCreateRequest,
  IGoalCreateDatabaseRequest,
} from '@/interfaces/goal.model'

export class GoalAdapter implements IAdapterWithList<IGoalDatabaseModel, IGoalModel> {
  toFrontend(dbData: IGoalDatabaseModel): IGoalModel {
    return {
      id: dbData.id,
      userId: dbData.user_id,
      title: dbData.title,
      description: dbData.description,
      status: dbData.status,
      targetDate: dbData.target_date,
      createdAt: dbData.created_at,
      updatedAt: dbData.updated_at,
    }
  }

  toDatabase(frontendData: IGoalModel): IGoalDatabaseModel {
    return {
      id: frontendData.id,
      user_id: frontendData.userId,
      title: frontendData.title,
      description: frontendData.description,
      status: frontendData.status,
      target_date: frontendData.targetDate,
      created_at: frontendData.createdAt,
      updated_at: frontendData.updatedAt,
    }
  }

  listToFrontend(dbList: IGoalDatabaseModel[]): IGoalModel[] {
    return dbList.map((item) => this.toFrontend(item))
  }

  listToDatabase(frontendList: IGoalModel[]): IGoalDatabaseModel[] {
    return frontendList.map((item) => this.toDatabase(item))
  }

  createRequestToDatabase(frontendData: IGoalCreateRequest): IGoalCreateDatabaseRequest {
    const dbData: IGoalCreateDatabaseRequest = {
      title: frontendData.title,
    }

    if (frontendData.description && frontendData.description.trim()) {
      dbData.description = frontendData.description
    }
    if (frontendData.targetDate && frontendData.targetDate.trim()) {
      dbData.target_date = frontendData.targetDate
    }

    return dbData
  }
}

export const goalAdapter = new GoalAdapter()
