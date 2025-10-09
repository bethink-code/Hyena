import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PriorityBadge, type Priority } from "./PriorityBadge";
import { StatusBadge, type EventStatus } from "./StatusBadge";
import { cn } from "@/lib/utils";
import { MapPin, User } from "lucide-react";
import type { EventCardProps } from "./EventCard";

interface EventGridProps {
  events: EventCardProps[];
  onEventClick?: (eventId: string) => void;
}

export function EventGrid({ events, onEventClick }: EventGridProps) {
  const borderColors = {
    critical: "border-l-event-critical",
    high: "border-l-event-high",
    medium: "border-l-event-medium",
    low: "border-l-border",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {events.map((event) => (
        <Card
          key={event.id}
          className={cn(
            "border-l-4 hover-elevate cursor-pointer transition-all",
            borderColors[event.priority]
          )}
          onClick={() => onEventClick?.(event.id)}
          data-testid={`grid-item-${event.id}`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-base leading-tight line-clamp-2">
                {event.title}
              </h3>
              <PriorityBadge priority={event.priority} />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {event.description}
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <StatusBadge status={event.status} />
              {event.location && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span className="text-xs">{event.location}</span>
                </div>
              )}
              {event.assignedTo && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span className="text-xs">{event.assignedTo}</span>
                </div>
              )}
              <span className="text-xs text-muted-foreground font-mono">
                {event.timestamp}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
