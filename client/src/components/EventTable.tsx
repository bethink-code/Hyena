import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PriorityBadge, type Priority } from "./PriorityBadge";
import { StatusBadge, type EventStatus } from "./StatusBadge";
import type { EventCardProps } from "./EventCard";

interface EventTableProps {
  events: EventCardProps[];
  onEventClick?: (eventId: string) => void;
}

export function EventTable({ events, onEventClick }: EventTableProps) {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow
              key={event.id}
              className="cursor-pointer hover-elevate"
              onClick={() => onEventClick?.(event.id)}
              data-testid={`table-row-${event.id}`}
            >
              <TableCell className="font-medium">
                <div>
                  <div className="font-semibold">{event.title}</div>
                  <div className="text-sm text-muted-foreground line-clamp-1">
                    {event.description}
                  </div>
                </div>
              </TableCell>
              <TableCell>{event.location || "-"}</TableCell>
              <TableCell>
                <PriorityBadge priority={event.priority} />
              </TableCell>
              <TableCell>
                <StatusBadge status={event.status} />
              </TableCell>
              <TableCell>{event.assignedTo || "-"}</TableCell>
              <TableCell className="font-mono text-sm">
                {event.timestamp}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
