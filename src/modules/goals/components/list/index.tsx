"use client";

import { Button } from "@/atoms/button";
import { useEffect, useState } from "react";
import { GoalsApi } from "@/api/goals";
import { GoalsCreate } from "../create";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { GOAL_STATUS_COLOR, GOAL_STATUS_LABEL } from "../../constants";
import { formatDate } from "../../utils";
import { Input } from "@/atoms/input";
import { Chip, Tab, Tabs } from "@mui/material";
import { EGoalStatus, type IGoalModel } from "@/interfaces/goal.model";
import { PageLayout } from "@/components/PageLayout";
import AddIcon from "@mui/icons-material/Add";
import { RawLogsCreate } from "@/modules/raw-logs/components/create";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
type StatusTab = "all" | EGoalStatus;

const TABS: StatusTab[] = [
  "all",
  EGoalStatus.NOT_STARTED,
  EGoalStatus.IN_PROGRESS,
  EGoalStatus.COMPLETED,
];

export function GoalsList() {
  const [createOpen, setCreateOpen] = useState(false);

  const [goals, setGoals] = useState<IGoalModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<StatusTab>("all");
  const [logGoalId, setLogGoalId] = useState<string | null>(null);

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

  const keyword = search.trim().toLowerCase();
  const searchedGoals = goals.filter((goal) =>
    goal.title.toLowerCase().includes(keyword),
  );
  const visibleGoals = searchedGoals.filter(
    (goal) => tab === "all" || goal.status === tab,
  );

  const countFor = (t: StatusTab) =>
    t === "all"
      ? searchedGoals.length
      : searchedGoals.filter((goal) => goal.status === t).length;

  const ready = !loading && !error;
  const isEmpty = ready && goals.length === 0;
  const noMatch = ready && goals.length > 0 && visibleGoals.length === 0;

  const clearFilters = () => {
    setSearch("");
    setTab("all");
  };

  return (
    <PageLayout
      title="Goals"
      subtitle="Everything you're working toward right now"
      actions={
        <Button startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
          Create Goal
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="w-full md:w-72">
            <Input
              placeholder="Search goals"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Tabs
            value={tab}
            onChange={(_, value) => setTab(value)}
            variant="scrollable"
          >
            {TABS.map((t) => (
              <Tab
                key={t}
                value={t}
                label={`${t === "all" ? "All" : GOAL_STATUS_LABEL[t]} (${countFor(t)})`}
              />
            ))}
          </Tabs>
        </div>
        {isEmpty && (
          <p className="text-sm text-gray-500">
            No goals yet. Create your first one.
          </p>
        )}

        {noMatch && (
          <div className="flex flex-col items-start gap-2">
            <p className="text-sm text-gray-500">No goals match your filters</p>
            <Button variant="text" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        )}

        {visibleGoals.length > 0 && (
          <ul className="flex flex-col gap-2">
            {visibleGoals.map((goal) => (
              <li
                key={goal.id}
                className="flex items-center justify-between gap-4 rounded border border-gray-200 p-4 hover:bg-gray-50"
              >
                <div className="flex min-w-0 flex-col gap-2">
                  <Chip
                    size="small"
                    className="self-start"
                    label={GOAL_STATUS_LABEL[goal.status]}
                    color={GOAL_STATUS_COLOR[goal.status]}
                  />
                  <Link
                    href={ROUTES.GOALS.DETAIL(goal.id)}
                    className="break-words font-semibold hover:underline"
                  >
                    {goal.title}
                  </Link>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                    <span>
                      {formatDate(goal.startDate)} - {formatDate(goal.endDate)}
                    </span>
                    <span aria-hidden="true">|</span>
                    <span>{plural(goal.logsCount, "log")}</span>
                    <span aria-hidden="true">|</span>
                    <span>{plural(goal.achievementsCount, "achievement")}</span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="secondary"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => setLogGoalId(goal.id)}
                  >
                    Add log
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <GoalsCreate
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onSaved={() => setReloadKey((k) => k + 1)}
        />

        {logGoalId && (
          <RawLogsCreate
            open
            defaultGoalId={logGoalId}
            onClose={() => setLogGoalId(null)}
            onCreated={() => setReloadKey((k) => k + 1)}
          />
        )}
      </div>
    </PageLayout>
  );
}
