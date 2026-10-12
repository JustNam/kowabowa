"use client";

import { Button } from "@/atoms/button";
import { useEffect, useState } from "react";
import { GoalsApi } from "@/api/goals";
import { GoalsCreate } from "../create";
import type { IGoalModel } from "@/interfaces/goal.model";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export function GoalsList() {
  const [createOpen, setCreateOpen] = useState(false);

  const [goals, setGoals] = useState<IGoalModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    GoalsApi.list()
      .then(({ data }) => {
        setGoals(data);
        setError(null);
      })
      .catch(() => setError("Could not load your goals."))
      .finally(() => setLoading(false));
  }, []);

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
                className="block rounded border border-gray-200 p-3 hover:bg-gray-50"
              >
                {goal.title}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <GoalsCreate
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => console.log("Goal created")}
      />
    </div>
  );
}
