import { GoalsDetail } from "@/modules/goals/components/detail";

export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <GoalsDetail id={id} />
    </div>
  );
}
