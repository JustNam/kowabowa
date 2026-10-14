"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GoalsApi } from "@/api/goals";
import { ROUTES } from "@/constants/routes";
import type { IGoalModel } from "@/interfaces/goal.model";
import { GOAL_STATUS_COLOR, GOAL_STATUS_LABEL } from "../../constants";
import { Chip } from "@mui/material";
import { RawLogsList } from "@/modules/raw-logs/components/list";
import { formatDate } from "../../utils";
import { Button } from "@/atoms/button";
import { GoalsCreate } from "../create";
import { useRouter } from "next/navigation";
import { Menu, MenuItem } from "@mui/material";
import { Modal } from "@/atoms/modal";

interface GoalsDetailProps {
  id: string;
}

export function GoalsDetail({ id }: GoalsDetailProps) {
  const [goal, setGoal] = useState<IGoalModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    GoalsApi.detail(id)
      .then(({ data }) => {
        setGoal(data.goal);
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

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await GoalsApi.remove(goal.id);
      router.push(ROUTES.GOALS.LIST);
    } catch (err) {
      setDeleteError((err as Error).message);
      setDeleting(false);
    }
  };

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
          <Button
            variant="ghost"
            aria-label="More actions"
            onClick={(e) => setMenuAnchor(e.currentTarget)}
          >
            •••
          </Button>
        </div>
        <Menu
          anchorEl={menuAnchor}
          open={!!menuAnchor}
          onClose={() => setMenuAnchor(null)}
        >
          <MenuItem
            sx={{ color: "error.main" }}
            onClick={() => {
              setMenuAnchor(null);
              setDeleteOpen(true);
            }}
          >
            Delete goal
          </MenuItem>
        </Menu>
      </header>

      <div className="grid grid-cols-1 overflow-hidden rounded-lg border border-gray-200 lg:grid-cols-[1fr_320px]">
        <section className="min-w-0 p-6">
          <RawLogsList goalId={goal.id} />
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
        </aside>
      </div>

      <Modal
        open={deleteOpen}
        onClose={() => {
          if (!deleting) setDeleteOpen(false);
        }}
        title="Delete this goal?"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-700">
            “{goal.title}” and all of its logs will be deleted. This can&apos;t
            be undone.
          </p>
          {deleteError && (
            <p role="alert" className="text-sm text-red-600">
              {deleteError}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete goal"}
            </Button>
          </div>
        </div>
      </Modal>

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
