import { EventCard, type EventCardProps } from "./EventCard";
import { EventTable } from "./EventTable";
import { EventGrid } from "./EventGrid";
import { ViewSwitcher, type ViewMode } from "./ViewSwitcher";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useState } from "react";

interface EventQueueProps {
  events: EventCardProps[];
  onEventClick?: (eventId: string) => void;
  className?: string;
}

export function EventQueue({ events, onEventClick, className }: EventQueueProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("card");

  return (
    <div className={className}>
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search incidents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              data-testid="input-search"
            />
          </div>
          <ViewSwitcher view={viewMode} onViewChange={setViewMode} />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40" data-testid="select-status-filter">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full sm:w-40" data-testid="select-priority-filter">
              <SelectValue placeholder="All Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {viewMode === "card" && (
        <div className="space-y-3">
          {events.map((event) => (
            <EventCard
              key={event.id}
              {...event}
              onView={() => onEventClick?.(event.id)}
            />
          ))}
        </div>
      )}

      {viewMode === "table" && (
        <EventTable events={events} onEventClick={onEventClick} />
      )}

      {viewMode === "grid" && (
        <EventGrid events={events} onEventClick={onEventClick} />
      )}
    </div>
  );
}
