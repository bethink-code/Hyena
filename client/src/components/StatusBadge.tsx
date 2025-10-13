import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Circle } from "lucide-react";

export type IncidentStatus = "new" | "assigned" | "in_progress" | "resolved" | "closed";

interface StatusBadgeProps {
  status: IncidentStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants = {
    new: { bg: "bg-primary/10 text-primary", dot: "fill-primary text-primary" },
    assigned: { bg: "bg-event-high/10 text-event-high", dot: "fill-event-high text-event-high" },
    in_progress: { bg: "bg-event-medium/10 text-event-medium", dot: "fill-event-medium text-event-medium" },
    resolved: { bg: "bg-event-success/10 text-event-success", dot: "fill-event-success text-event-success" },
    closed: { bg: "bg-muted text-muted-foreground", dot: "fill-muted-foreground text-muted-foreground" },
  };

  const labels = {
    new: "New",
    assigned: "Assigned",
    in_progress: "In Progress",
    resolved: "Resolved",
    closed: "Closed",
  };

  return (
    <Badge
      variant="secondary"
      className={cn("gap-1.5 font-medium", variants[status].bg, className)}
      data-testid={`badge-status-${status}`}
    >
      <Circle className={cn("h-2 w-2", variants[status].dot)} />
      {labels[status]}
    </Badge>
  );
}
