import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PriorityBadge, type Priority } from "./PriorityBadge";
import { StatusBadge, type IncidentStatus } from "./StatusBadge";
import { cn } from "@/lib/utils";
import { MapPin, User } from "lucide-react";
import type { IncidentCardProps } from "./IncidentCard";

interface IncidentGridProps {
  incidents: IncidentCardProps[];
  onIncidentClick?: (incidentId: string) => void;
}

export function IncidentGrid({ incidents, onIncidentClick }: IncidentGridProps) {
  const borderColors = {
    critical: "border-l-event-critical",
    high: "border-l-event-high",
    medium: "border-l-event-medium",
    low: "border-l-border",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {incidents.map((incident) => (
        <Card
          key={incident.id}
          className={cn(
            "border-l-4 hover-elevate cursor-pointer transition-all",
            borderColors[incident.priority]
          )}
          onClick={() => onIncidentClick?.(incident.id)}
          data-testid={`grid-item-${incident.id}`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-base leading-tight line-clamp-2">
                {incident.title}
              </h3>
              <PriorityBadge priority={incident.priority} />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {incident.description}
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <StatusBadge status={incident.status} />
              {incident.location && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span className="text-xs">{incident.location}</span>
                </div>
              )}
              {incident.assignedTo && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span className="text-xs">{incident.assignedTo}</span>
                </div>
              )}
              <span className="text-xs text-muted-foreground font-mono">
                {incident.timestamp}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
