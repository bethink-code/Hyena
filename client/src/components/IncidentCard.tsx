import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PriorityBadge, type Priority } from "./PriorityBadge";
import { StatusBadge, type IncidentStatus } from "./StatusBadge";
import { cn } from "@/lib/utils";
import { Clock, MapPin, User } from "lucide-react";
import { Button } from "./ui/button";

export interface IncidentCardProps {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: IncidentStatus;
  location?: string;
  assignedTo?: string;
  timestamp: string;
  onView?: () => void;
  className?: string;
}

export function IncidentCard({
  id,
  title,
  description,
  priority,
  status,
  location,
  assignedTo,
  timestamp,
  onView,
  className,
}: IncidentCardProps) {
  const borderColors = {
    critical: "border-l-event-critical",
    high: "border-l-event-high",
    medium: "border-l-event-medium",
    low: "border-l-border",
  };

  return (
    <Card
      className={cn(
        "border-l-4 hover-elevate cursor-pointer transition-all",
        borderColors[priority],
        className
      )}
      onClick={onView}
      data-testid={`card-incident-${id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold text-lg leading-tight" data-testid={`text-incident-title-${id}`}>
              {title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <PriorityBadge priority={priority} />
            <span className="text-xs text-muted-foreground font-mono" data-testid={`text-timestamp-${id}`}>
              {timestamp}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <StatusBadge status={status} />
            {location && (
              <div className="flex items-center gap-1" data-testid={`text-location-${id}`}>
                <MapPin className="h-4 w-4" />
                <span>{location}</span>
              </div>
            )}
            {assignedTo && (
              <div className="flex items-center gap-1" data-testid={`text-assigned-${id}`}>
                <User className="h-4 w-4" />
                <span>{assignedTo}</span>
              </div>
            )}
          </div>
          {onView && (
            <Button variant="outline" size="sm" onClick={onView} data-testid={`button-view-${id}`}>
              View Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
