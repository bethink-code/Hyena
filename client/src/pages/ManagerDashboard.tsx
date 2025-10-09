import { AppLayout } from "@/components/AppLayout";
import { PropertySelector } from "@/components/PropertySelector";
import { KPIWidget } from "@/components/KPIWidget";
import { EventQueue } from "@/components/EventQueue";
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

  const mockEvents = [
    {
      id: "evt-001",
      title: "Wi-Fi Not Working - Room 305",
      description: "Guest reported complete loss of connectivity in room 305. Unable to connect any devices.",
      priority: "critical" as const,
      status: "new" as const,
      location: "Room 305",
      timestamp: "2m ago",
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
    },
    {
      id: "evt-004",
      title: "VPN Connection Issues",
      description: "Business guest unable to establish VPN connection for remote work.",
      priority: "high" as const,
      status: "new" as const,
      location: "Room 508",
      timestamp: "45m ago",
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
            onEventClick={(id) => console.log("View event:", id)}
          />
        </div>
      </div>
    </AppLayout>
  );
}
