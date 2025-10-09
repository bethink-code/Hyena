import { EventTable } from "../EventTable";

export default function EventTableExample() {
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
  ];

  return (
    <div className="max-w-6xl">
      <EventTable
        events={mockEvents}
        onEventClick={(id) => console.log("View event:", id)}
      />
    </div>
  );
}
