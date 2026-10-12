import type { IAdapterWithList } from "@/interfaces/adapter.model";
import type {
  IGoalDatabaseModel,
  IGoalModel,
  IGoalCreateRequest,
  IGoalCreateDatabaseRequest,
} from "@/interfaces/goal.model";

import { EGoalStatus } from "@/interfaces/goal.model";

// so sánh chuỗi 'YYYY-MM-DD' theo ngày giờ máy người dùng
function computeStatus(startDate: string, endDate: string): EGoalStatus {
  const today = new Date().toLocaleDateString("en-CA"); // 2026-10-10
  if (today < startDate) return EGoalStatus.NOT_STARTED;
  if (today > endDate) return EGoalStatus.COMPLETED;
  return EGoalStatus.IN_PROGRESS;
}

export class GoalAdapter implements IAdapterWithList<
  IGoalDatabaseModel,
  IGoalModel
> {
  toFrontend(dbData: IGoalDatabaseModel): IGoalModel {
    return {
      id: dbData.id,
      userId: dbData.user_id,
      title: dbData.title,
      description: dbData.description,
      status: computeStatus(dbData.start_date, dbData.end_date),
      startDate: dbData.start_date,
      endDate: dbData.end_date,
      createdAt: dbData.created_at,
      updatedAt: dbData.updated_at,
      logsCount: dbData.logs_count ?? 0,
      achievementsCount: dbData.achievements_count ?? 0,
    };
  }

  toDatabase(frontendData: IGoalModel): IGoalDatabaseModel {
    return {
      id: frontendData.id,
      user_id: frontendData.userId,
      title: frontendData.title,
      description: frontendData.description,
      start_date: frontendData.startDate,
      end_date: frontendData.endDate,
      created_at: frontendData.createdAt,
      updated_at: frontendData.updatedAt,
      logs_count: frontendData.logsCount,
      achievements_count: frontendData.achievementsCount,
    };
  }

  listToFrontend(dbList: IGoalDatabaseModel[]): IGoalModel[] {
    return dbList.map((item) => this.toFrontend(item));
  }

  listToDatabase(frontendList: IGoalModel[]): IGoalDatabaseModel[] {
    return frontendList.map((item) => this.toDatabase(item));
  }

  createRequestToDatabase(
    frontendData: IGoalCreateRequest,
  ): IGoalCreateDatabaseRequest {
    const dbData: IGoalCreateDatabaseRequest = {
      title: frontendData.title,
      start_date: frontendData.startDate,
      end_date: frontendData.endDate,
    };

    if (frontendData.description && frontendData.description.trim()) {
      dbData.description = frontendData.description;
    }

    return dbData;
  }
}

export const goalAdapter = new GoalAdapter();
