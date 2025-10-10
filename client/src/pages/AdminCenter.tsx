import { AppLayout } from "@/components/AppLayout";
import { PropertyList } from "@/components/PropertyList";
import { KPIWidget } from "@/components/KPIWidget";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { Event } from "@shared/schema";
import {
  LayoutDashboard,
  Building2,
  AlertTriangle,
  TrendingUp,
  Users as UsersIcon,
  Settings,
  BarChart3,
  FileText,
  Puzzle,
  Shield,
} from "lucide-react";

export default function AdminCenter() {
  const [, setLocation] = useLocation();
  
  // Fetch all events to calculate property-specific incident counts
  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });
  const navSections = [
    {
      label: "Overview",
      items: [
        { title: "Portfolio Dashboard", href: "/admin", icon: LayoutDashboard },
      ],
    },
    {
      label: "Management",
      items: [
        { title: "Users & Roles", href: "/admin/users", icon: UsersIcon },
        { title: "System Config", href: "/admin/config", icon: Settings },
        { title: "Integrations", href: "/admin/integrations", icon: Puzzle },
      ],
    },
    {
      label: "Reporting",
      items: [
        { title: "Regional Analytics", href: "/admin/analytics", icon: BarChart3 },
        { title: "Reports", href: "/admin/reports", icon: FileText },
        { title: "Audit Logs", href: "/admin/audit", icon: Shield },
      ],
    },
  ];

  // Define all properties in the portfolio
  const propertyDefinitions = [
    { id: "1", name: "The Table Bay Hotel", location: "Cape Town, Western Cape" },
    { id: "2", name: "Umhlanga Sands Resort", location: "Durban, KwaZulu-Natal" },
    { id: "3", name: "Saxon Hotel", location: "Johannesburg, Gauteng" },
    { id: "4", name: "Sandton Sun Hotel", location: "Sandton, Gauteng" },
    { id: "5", name: "Waterfront Lodge", location: "Cape Town, Western Cape" },
    { id: "6", name: "Kruger Park Lodge", location: "Mpumalanga" },
  ];

  // Calculate incident counts per property from actual events
  const propertyIncidentCounts = propertyDefinitions.reduce((acc, prop) => {
    const propertyEvents = events.filter(e => e.propertyId === prop.id && e.status !== 'resolved');
    acc[prop.id] = propertyEvents.length;
    return acc;
  }, {} as Record<string, number>);

  // Determine property status based on incident count and priority
  const getPropertyStatus = (propertyId: string): "healthy" | "degraded" | "critical" | "offline" => {
    const propertyEvents = events.filter(e => e.propertyId === propertyId && e.status !== 'resolved');
    const hasCritical = propertyEvents.some(e => e.priority === 'critical');
    const activeCount = propertyEvents.length;

    if (hasCritical) return "critical";
    if (activeCount > 3) return "degraded";
    if (activeCount > 0) return "degraded";
    return "healthy";
  };

  // Build properties array with real-time data
  const properties = propertyDefinitions.map(prop => ({
    id: prop.id,
    name: prop.name,
    location: prop.location,
    status: getPropertyStatus(prop.id),
    incidentCount: propertyIncidentCounts[prop.id] || 0,
  }));

  // Calculate total active incidents
  const totalActiveIncidents = events.filter(e => e.status !== 'resolved').length;

  return (
    <AppLayout
      title="Platform Administration Center"
      homeRoute="/admin"
      notificationCount={2}
      navSections={navSections}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-1">Portfolio Overview</h2>
          <p className="text-muted-foreground">Multi-property health and performance metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPIWidget title="Total Properties" value={propertyDefinitions.length} icon={Building2} />
          <KPIWidget
            title="Active Incidents"
            value={totalActiveIncidents}
            change={0}
            trend="down"
            icon={AlertTriangle}
          />
          <KPIWidget
            title="Guest Satisfaction"
            value="4.2/5"
            change={8}
            trend="up"
            icon={TrendingUp}
          />
          <KPIWidget
            title="Total Users"
            value="1.2k"
            change={5}
            trend="up"
            icon={UsersIcon}
          />
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Property Status</h3>
          <PropertyList
            properties={properties}
            onPropertyClick={(property) => setLocation(`/admin/properties/${property.id}`)}
          />
        </div>
      </div>
    </AppLayout>
  );
}
