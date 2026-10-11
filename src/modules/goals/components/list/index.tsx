"use client";

import { Button } from "@/atoms/button";
import { useState } from "react";
import { GoalsCreate } from "../create";

// TODO: build the Goals list.
// - Fetch goals on mount with `GoalsApi.list()` ('@/api/goals'); hold
//   them in local state along with loading/error flags.
// - Render each goal as a link to ROUTES.GOALS.DETAIL(goal.id)
//   ('@/constants/routes').
// - A "New goal" button that opens the Create Goal modal — import
//   `GoalsCreate` from '../create', manage its open/closed state here,
//   and pass it an `onCreated` callback that refetches the list.
export function GoalsList() {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button onClick={() => setCreateOpen(true)}>Create Goal</Button>
      </div>
      <GoalsCreate
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => console.log("Goal created")}
      />
    </div>
  );
}
