"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GoalsApi } from "@/api/goals";
import { ROUTES } from "@/constants/routes";
import type { IGoalModel, ISkillUsed } from "@/interfaces/goal.model";
import { GOAL_STATUS_COLOR, GOAL_STATUS_LABEL } from "../../constants";
import { Chip } from "@mui/material";
import { RawLogsList } from "@/modules/raw-logs/components/list";
import { formatDate } from "../../utils";
import { Button } from "@/atoms/button";
import { GoalsCreate } from "../create";
import { useRouter } from "next/navigation";
import { GoalActions } from "../actions";

interface GoalsDetailProps {
  id: string;
}

export function GoalsDetail({ id }: GoalsDetailProps) {
  const [goal, setGoal] = useState<IGoalModel | null>(null);
  const [skillsUsed, setSkillsUsed] = useState<ISkillUsed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const router = useRouter();

  useEffect(() => {
    GoalsApi.detail(id)
      .then(({ data }) => {
        setGoal(data.goal);
        setSkillsUsed(data.skillsUsed);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, reloadKey]);
  if (loading) return <p className="text-sm text-gray-500">Loading goal...</p>;
  if (error || !goal) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-red-600">{error ?? "Goal not found"}</p>
        <Link href={ROUTES.GOALS.LIST} className="text-sm underline">
          ← Back to goals
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <Link
          href={ROUTES.GOALS.LIST}
          aria-label="Back to goals"
          className="rounded p-1 text-gray-600 hover:bg-gray-100"
        >
          ←
        </Link>

        <h1 className="text-2xl font-semibold">{goal.title}</h1>
        <div className="ml-auto">
          <GoalActions
            goal={goal}
            onSaved={() => setReloadKey((k) => k + 1)}
            onDeleted={() => router.push(ROUTES.GOALS.LIST)}
          />
        </div>
      </header>

      <div className="grid grid-cols-1 overflow-hidden rounded-lg border border-gray-200 lg:grid-cols-[1fr_320px]">
        <section className="min-w-0 p-6">
          <RawLogsList
            goalId={goal.id}
            onChanged={() => setReloadKey((k) => k + 1)}
          />
        </section>

        <aside className="flex flex-col gap-4 border-t border-gray-200 p-6 lg:border-l lg:border-t-0">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Details</h2>
            <Button
              variant="text"
              size="small"
              onClick={() => setEditOpen(true)}
            >
              Edit
            </Button>
          </div>
          <dl className="grid grid-cols-[80px_1fr] gap-y-3 text-sm">
            <dt className="text-gray-500">Status</dt>
            <dd>
              <Chip
                size="small"
                label={GOAL_STATUS_LABEL[goal.status]}
                color={GOAL_STATUS_COLOR[goal.status]}
              />
            </dd>
            <dt className="text-gray-500">Dates</dt>
            <dd>
              {formatDate(goal.startDate)} - {formatDate(goal.endDate)}
            </dd>
          </dl>
          {goal.description && (
            <p className="whitespace-pre-line text-sm text-gray-700">
              {goal.description}
            </p>
          )}

          <section className="flex flex-col gap-2 border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold">Skills used</h3>
            {skillsUsed.length === 0 ? (
              <p className="text-sm text-gray-500">
                No skills yet. Add a log with a skill to see it here.
              </p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {skillsUsed.map((skill) => (
                  <li key={skill.id}>
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`${skill.title} - ${skill.logsCount}`}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>

      {editOpen && (
        <GoalsCreate
          open
          goal={goal}
          onClose={() => setEditOpen(false)}
          onSaved={() => setReloadKey((k) => k + 1)}
        />
      )}
    </div>
  );
}
