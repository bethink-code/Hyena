import { EventCard } from "../EventCard";

export default function EventCardExample() {
  return (
    <div className="space-y-4 max-w-3xl">
      <EventCard
        id="evt-001"
        title="Wi-Fi Not Working - Room 305"
        description="Guest reported complete loss of connectivity in room 305. Unable to connect any devices."
        priority="critical"
        status="new"
        location="Room 305"
        timestamp="2m ago"
        onView={() => console.log("View event evt-001")}
      />
      <EventCard
        id="evt-002"
        title="Slow Internet Speed - Conference Hall A"
        description="Multiple guests experiencing degraded performance during conference."
        priority="high"
        status="assigned"
        location="Conference Hall A"
        assignedTo="John Smith"
        timestamp="15m ago"
        onView={() => console.log("View event evt-002")}
      />
      <EventCard
        id="evt-003"
        title="Device Connection Limit Reached"
        description="Guest attempting to connect additional device but has reached limit."
        priority="medium"
        status="in_progress"
        location="Room 412"
        assignedTo="Sarah Wilson"
        timestamp="1h ago"
        onView={() => console.log("View event evt-003")}
      />
    </div>
  );
}
