"use client";

import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import { Menu, MenuItem } from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Button } from "@/atoms/button";
import { Modal } from "@/atoms/modal";
import { GoalsApi } from "@/api/goals";
import type { IGoalModel } from "@/interfaces/goal.model";
import { GoalsCreate } from "../create";

interface GoalActionsProps {
  goal: IGoalModel;
  onSaved: () => void;
  onDeleted: () => void;
}

export function GoalActions({ goal, onSaved, onDeleted }: GoalActionsProps) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await GoalsApi.remove(goal.id);
      setDeleteOpen(false);
      onDeleted();
    } catch (err) {
      setDeleteError((err as Error).message);
      setDeleting(false);
    }
  };

  return (
    <>
      <IconButton
        aria-label="More actions"
        size="small"
        onClick={(e) => setMenuAnchor(e.currentTarget)}
      >
        <MoreHorizIcon fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={menuAnchor}
        open={!!menuAnchor}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem
          onClick={() => {
            setMenuAnchor(null);
            setEditOpen(true);
          }}
        >
          Edit Goal
        </MenuItem>
        <MenuItem
          onClick={() => {
            setMenuAnchor(null);
            setDeleteOpen(true);
          }}
        >
          Delete Goal
        </MenuItem>
      </Menu>

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
          onSaved={onSaved}
        />
      )}
    </>
  );
}
