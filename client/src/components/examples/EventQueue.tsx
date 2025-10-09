import { EventQueue } from "../EventQueue";

export default function EventQueueExample() {
  const mockEvents = [
    {
      id: "evt-001",
      title: "Wi-Fi Not Working - Room 305",
      description: "Guest reported complete loss of connectivity",
      priority: "critical" as const,
      status: "new" as const,
      location: "Room 305",
      timestamp: "2m ago",
    },
    {
      id: "evt-002",
      title: "Slow Internet - Conference Hall",
      description: "Multiple guests experiencing degraded performance",
      priority: "high" as const,
      status: "assigned" as const,
      location: "Conference Hall A",
      assignedTo: "John Smith",
      timestamp: "15m ago",
    },
    {
      id: "evt-003",
      title: "Device Limit Reached",
      description: "Guest attempting to connect additional device",
      priority: "medium" as const,
      status: "in_progress" as const,
      location: "Room 412",
      assignedTo: "Sarah Wilson",
      timestamp: "1h ago",
    },
  ];

  return (
    <div className="max-w-4xl">
      <EventQueue
        events={mockEvents}
        onEventClick={(id) => console.log("View event:", id)}
      />
    </div>
  );
}
