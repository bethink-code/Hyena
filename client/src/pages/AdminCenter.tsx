import { AppLayout } from "@/components/AppLayout";
import { PropertyList } from "@/components/PropertyList";
import { KPIWidget } from "@/components/KPIWidget";
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
  const navSections = [
    {
      label: "Overview",
      items: [
        { title: "Portfolio Dashboard", href: "/admin", icon: LayoutDashboard },
      ],
    },
  ];

  const properties = [
    {
      name: "Grand Hotel Downtown",
      location: "New York, NY",
      status: "healthy" as const,
      incidentCount: 0,
    },
    {
      name: "Beachside Resort",
      location: "Miami, FL",
      status: "degraded" as const,
      incidentCount: 3,
    },
    {
      name: "Mountain Lodge",
      location: "Denver, CO",
      status: "critical" as const,
      incidentCount: 8,
    },
    {
      name: "Urban Suites",
      location: "San Francisco, CA",
      status: "healthy" as const,
      incidentCount: 1,
    },
    {
      name: "Lakeside Inn",
      location: "Seattle, WA",
      status: "degraded" as const,
      incidentCount: 4,
    },
    {
      name: "Desert Retreat",
      location: "Phoenix, AZ",
      status: "healthy" as const,
      incidentCount: 0,
    },
  ];

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
          <KPIWidget title="Total Properties" value={6} icon={Building2} />
          <KPIWidget
            title="Active Incidents"
            value={16}
            change={-12}
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
            onPropertyClick={(property) => console.log("View property:", property.name)}
          />
        </div>
      </div>
    </AppLayout>
  );
}
