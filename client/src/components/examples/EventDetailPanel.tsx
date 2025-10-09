import { useState } from "react";
import { EventDetailPanel } from "../EventDetailPanel";
import { Button } from "@/components/ui/button";

export default function EventDetailPanelExample() {
  const [open, setOpen] = useState(false);

  const mockEvent = {
    id: "evt-001",
    title: "Wi-Fi Not Working - Room 305",
    description: "Guest reported complete loss of connectivity in room 305. Unable to connect any devices.",
    priority: "critical" as const,
    status: "assigned" as const,
    location: "Room 305",
    assignedTo: "John Smith",
    timestamp: "2m ago",
    category: "Network Connectivity",
    affectedGuests: 3,
    estimatedResolution: "30 minutes",
    rootCause: "Access point firmware corruption detected. Device became unresponsive after automatic update.",
    timeline: [
      {
        timestamp: "2m ago",
        action: "Incident reported by guest",
        actor: "Guest Portal",
      },
      {
        timestamp: "1m ago",
        action: "Assigned to technician",
        actor: "System Auto-Assign",
      },
      {
        timestamp: "30s ago",
        action: "Technician acknowledged",
        actor: "John Smith",
      },
    ],
  };

  return (
    <div>
      <Button onClick={() => setOpen(true)} data-testid="button-open-detail">
        View Event Details Panel
      </Button>
      <EventDetailPanel
        event={mockEvent}
        open={open}
        onClose={() => setOpen(false)}
        onAssign={(id) => console.log("Assign event:", id)}
        onResolve={(id) => console.log("Resolve event:", id)}
        onEscalate={(id) => console.log("Escalate event:", id)}
      />
    </div>
  );
}
