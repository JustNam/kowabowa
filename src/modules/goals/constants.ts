import { EGoalStatus } from "@/interfaces/goal.model";

export const GOAL_STATUS_LABEL: Record<EGoalStatus, string> = {
  [EGoalStatus.NOT_STARTED]: "Not started",
  [EGoalStatus.IN_PROGRESS]: "In progress",
  [EGoalStatus.COMPLETED]: "Completed",
};

export const GOAL_STATUS_COLOR: Record<
  EGoalStatus,
  "default" | "primary" | "success"
> = {
  [EGoalStatus.NOT_STARTED]: "default",
  [EGoalStatus.IN_PROGRESS]: "primary",
  [EGoalStatus.COMPLETED]: "success",
};
