import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PropertySelector } from "@/components/PropertySelector";
import { KPIWidget } from "@/components/KPIWidget";
import { EventQueue } from "@/components/EventQueue";
import { EventDetailPanel, type EventDetailProps } from "@/components/EventDetailPanel";
import {
  LayoutDashboard,
  AlertTriangle,
  Users,
  DollarSign,
  Clock,
  BarChart3,
  FileText,
  MessageSquare,
  Wifi,
} from "lucide-react";

export default function ManagerDashboard() {
  const [selectedEvent, setSelectedEvent] = useState<EventDetailProps | null>(null);
  const properties = [
    { id: "1", name: "Grand Hotel Downtown", location: "New York, NY" },
    { id: "2", name: "Beachside Resort", location: "Miami, FL" },
    { id: "3", name: "Mountain Lodge", location: "Denver, CO" },
  ];

  const navSections = [
    {
      label: "Main",
      items: [
        { title: "Dashboard", href: "/manager", icon: LayoutDashboard },
        { title: "Incident Queue", href: "/manager/incidents", icon: AlertTriangle },
        { title: "Network Status", href: "/manager/network", icon: Wifi },
      ],
    },
    {
      label: "Analysis",
      items: [
        { title: "Analytics", href: "/manager/analytics", icon: BarChart3 },
        { title: "Reports", href: "/manager/reports", icon: FileText },
      ],
    },
    {
      label: "Communication",
      items: [
        { title: "Guest Messages", href: "/manager/messages", icon: MessageSquare },
      ],
    },
  ];

  const mockEvents: EventDetailProps[] = [
    {
      id: "evt-001",
      title: "Wi-Fi Not Working - Room 305",
      description: "Guest reported complete loss of connectivity in room 305. Unable to connect any devices.",
      priority: "critical" as const,
      status: "new" as const,
      location: "Room 305",
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
          action: "Auto-diagnostic initiated",
          actor: "Monitoring System",
        },
      ],
    },
    {
      id: "evt-002",
      title: "Slow Internet Speed - Conference Hall A",
      description: "Multiple guests experiencing degraded performance during conference.",
      priority: "high" as const,
      status: "assigned" as const,
      location: "Conference Hall A",
      assignedTo: "John Smith",
      timestamp: "15m ago",
      category: "Performance",
      affectedGuests: 12,
      estimatedResolution: "1 hour",
      timeline: [
        {
          timestamp: "15m ago",
          action: "Incident reported",
          actor: "Property Manager",
        },
        {
          timestamp: "12m ago",
          action: "Assigned to John Smith",
          actor: "System",
        },
        {
          timestamp: "10m ago",
          action: "Technician en route",
          actor: "John Smith",
        },
      ],
    },
    {
      id: "evt-003",
      title: "Device Connection Limit Reached",
      description: "Guest attempting to connect additional device but has reached limit.",
      priority: "medium" as const,
      status: "in_progress" as const,
      location: "Room 412",
      assignedTo: "Sarah Wilson",
      timestamp: "1h ago",
      category: "Configuration",
      affectedGuests: 1,
      estimatedResolution: "15 minutes",
      rootCause: "Guest package allows 3 devices, customer has 4 devices. Requires upgrade or device prioritization.",
      timeline: [
        {
          timestamp: "1h ago",
          action: "Incident auto-created from guest portal",
          actor: "System",
        },
        {
          timestamp: "55m ago",
          action: "Assigned to Sarah Wilson",
          actor: "System",
        },
        {
          timestamp: "45m ago",
          action: "Contacted guest about upgrade options",
          actor: "Sarah Wilson",
        },
      ],
    },
    {
      id: "evt-004",
      title: "VPN Connection Issues",
      description: "Business guest unable to establish VPN connection for remote work.",
      priority: "high" as const,
      status: "new" as const,
      location: "Room 508",
      timestamp: "45m ago",
      category: "Advanced Services",
      affectedGuests: 1,
      estimatedResolution: "45 minutes",
      timeline: [
        {
          timestamp: "45m ago",
          action: "Incident reported via phone",
          actor: "Front Desk",
        },
      ],
    },
  ];

  return (
    <AppLayout
      title="Property Management Dashboard"
      homeRoute="/manager"
      notificationCount={4}
      navSections={navSections}
      sidebarHeader={
        <PropertySelector
          properties={properties}
          onPropertyChange={(id) => console.log("Property changed:", id)}
        />
      }
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-1">Performance Overview</h2>
          <p className="text-muted-foreground">Monitor incidents and operational metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPIWidget
            title="Active Incidents"
            value={12}
            change={-8}
            trend="down"
            icon={AlertTriangle}
          />
          <KPIWidget
            title="Affected Guests"
            value={45}
            change={-15}
            trend="down"
            icon={Users}
          />
          <KPIWidget
            title="Revenue at Risk"
            value="$2.3k"
            change={12}
            trend="up"
            icon={DollarSign}
          />
          <KPIWidget
            title="Avg Resolution Time"
            value="18m"
            change={-22}
            trend="down"
            icon={Clock}
          />
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Incident Queue</h3>
          <EventQueue
            events={mockEvents}
            onEventClick={(eventId) => {
              const event = mockEvents.find(e => e.id === eventId);
              if (event) setSelectedEvent(event);
            }}
          />
        </div>
      </div>

      <EventDetailPanel
        event={selectedEvent}
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onAssign={(id) => {
          console.log("Assign event:", id);
          setSelectedEvent(null);
        }}
        onResolve={(id) => {
          console.log("Resolve event:", id);
          setSelectedEvent(null);
        }}
        onEscalate={(id) => {
          console.log("Escalate event:", id);
          setSelectedEvent(null);
        }}
      />
    </AppLayout>
  );
}
