import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type Priority = "critical" | "high" | "medium" | "low";

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const variants = {
    critical: "bg-event-critical text-white",
    high: "bg-event-high text-white",
    medium: "bg-event-medium text-white",
    low: "bg-muted-foreground text-white",
  };

  return (
    <Badge
      className={cn("uppercase text-xs font-bold", variants[priority], className)}
      data-testid={`badge-priority-${priority}`}
    >
      {priority}
    </Badge>
  );
}
