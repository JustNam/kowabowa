import { backendApi } from "@/lib/backendApi";
import { goalAdapter } from "@/adapters";
import type {
  IGoalModel,
  IGoalCreateRequest,
  IGoalDatabaseModel,
  IGoalDetailDatabaseModel,
} from "@/interfaces/goal.model";

/**
 * Client-side API service. UI code never calls Supabase or fetch()
 * directly — it goes through a class like this, which talks to the
 * `goals` Edge Function in the companion kowabowa-backend repo and
 * converts snake_case database rows into camelCase frontend models via
 * the adapter.
 *
 * Same shape as CompetenciesApi (src/api/competencies.ts) and RawLogsApi
 * (src/api/rawLogs.ts).
 */
export class GoalsApi {
  static async list(): Promise<{ data: IGoalModel[] }> {
    const response = await backendApi.get<{ data: IGoalDatabaseModel[] }>(
      "/goals",
    );
    return { data: goalAdapter.listToFrontend(response.data.data) };
  }

  static async detail(
    id: string,
  ): Promise<{
    data: { goal: IGoalModel; logs: unknown[]; skills: unknown[] };
  }> {
    const response = await backendApi.get<{ data: IGoalDetailDatabaseModel }>(
      `/goals/${id}`,
    );
    const { goal, logs, skills } = response.data.data;
    return { data: { goal: goalAdapter.toFrontend(goal), logs, skills } };
  }

  static async update(
    id: string,
    payload: IGoalCreateRequest,
  ): Promise<{ data: IGoalModel }> {
    const dbPayload = goalAdapter.createRequestToDatabase(payload);
    const response = await backendApi.put<{ data: IGoalDatabaseModel }>(
      `/goals/${id}`,
      dbPayload,
    );
    return { data: goalAdapter.toFrontend(response.data.data) };
  }

  static async remove(id: string): Promise<void> {
    await backendApi.delete(`/goals/${id}`);
  }

  static async create(
    payload: IGoalCreateRequest,
  ): Promise<{ data: IGoalModel }> {
    const dbPayload = goalAdapter.createRequestToDatabase(payload);
    const response = await backendApi.post<{ data: IGoalDatabaseModel }>(
      "/goals",
      dbPayload,
    );
    return { data: goalAdapter.toFrontend(response.data.data) };
  }
}
