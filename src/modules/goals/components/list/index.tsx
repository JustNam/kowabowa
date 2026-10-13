"use client";

import { Button } from "@/atoms/button";
import { useEffect, useState } from "react";
import { GoalsApi } from "@/api/goals";
import { GoalsCreate } from "../create";
import type { IGoalModel } from "@/interfaces/goal.model";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { Chip } from "@mui/material";
import { GOAL_STATUS_COLOR, GOAL_STATUS_LABEL } from "../../constants";
import { formatDate } from "../../utils";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function GoalsList() {
  const [createOpen, setCreateOpen] = useState(false);

  const [goals, setGoals] = useState<IGoalModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    GoalsApi.list()
      .then(({ data }) => {
        if (cancelled) return;
        setGoals(data);
        setError(null);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load your goals.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button onClick={() => setCreateOpen(true)}>Create Goal</Button>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading goals...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && goals.length === 0 && (
        <p className="text-sm text-gray-500">
          No goals yet. Create your first one
        </p>
      )}

      {goals.length > 0 && (
        <ul className="flex flex-col gap-2">
          {goals.map((goal) => (
            <li key={goal.id}>
              <Link
                href={ROUTES.GOALS.DETAIL(goal.id)}
                className="flex flex-col gap-2 rounded border border-gray-200 p-4 hover:bg-gray-50"
              >
                <Chip
                  size="small"
                  className="self-start"
                  label={GOAL_STATUS_LABEL[goal.status]}
                  color={GOAL_STATUS_COLOR[goal.status]}
                />

                <span className="break-words font-semibold">{goal.title}</span>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                  <span>
                    {formatDate(goal.startDate)} - {formatDate(goal.endDate)}
                  </span>
                  <span aria-hidden="true">|</span>
                  <span>{plural(goal.logsCount, "log")} </span>
                  <span aria-hidden="true">| </span>
                  <span>{plural(goal.achievementsCount, "achievement")}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <GoalsCreate
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={() => setReloadKey((k) => k + 1)}
      />
    </div>
  );
}
