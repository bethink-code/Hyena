import { StatusBadge } from "../StatusBadge";

export default function StatusBadgeExample() {
  return (
    <div className="flex gap-2">
      <StatusBadge status="new" />
      <StatusBadge status="assigned" />
      <StatusBadge status="in_progress" />
      <StatusBadge status="resolved" />
      <StatusBadge status="closed" />
    </div>
  );
}
