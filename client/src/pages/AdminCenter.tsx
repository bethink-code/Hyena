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
        { title: "All Properties", href: "/admin/properties", icon: Building2 },
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

  const properties = [
    {
      name: "The Table Bay Hotel",
      location: "Cape Town, Western Cape",
      status: "healthy" as const,
      incidentCount: 0,
    },
    {
      name: "Umhlanga Sands Resort",
      location: "Durban, KwaZulu-Natal",
      status: "degraded" as const,
      incidentCount: 3,
    },
    {
      name: "Saxon Hotel",
      location: "Johannesburg, Gauteng",
      status: "critical" as const,
      incidentCount: 8,
    },
    {
      name: "Sandton Sun Hotel",
      location: "Sandton, Gauteng",
      status: "healthy" as const,
      incidentCount: 1,
    },
    {
      name: "Waterfront Lodge",
      location: "Cape Town, Western Cape",
      status: "degraded" as const,
      incidentCount: 4,
    },
    {
      name: "Kruger Park Lodge",
      location: "Mpumalanga",
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
