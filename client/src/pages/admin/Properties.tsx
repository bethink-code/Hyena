import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { PropertyList } from "@/components/PropertyList";
import {
  LayoutDashboard,
  Building2,
  Users as UsersIcon,
  Settings,
  BarChart3,
  FileText,
  Puzzle,
  Shield,
} from "lucide-react";

type PropertyWithId = {
  id: string;
  name: string;
  location: string;
  status: "healthy" | "degraded" | "critical" | "offline";
  incidentCount: number;
};

export default function Properties() {
  const [, setLocation] = useLocation();

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

  const properties: PropertyWithId[] = [
    { id: "1", name: "The Table Bay Hotel", location: "Cape Town, Western Cape", status: "healthy" as const, incidentCount: 0 },
    { id: "2", name: "Umhlanga Sands Resort", location: "Durban, KwaZulu-Natal", status: "degraded" as const, incidentCount: 3 },
    { id: "3", name: "Saxon Hotel", location: "Johannesburg, Gauteng", status: "critical" as const, incidentCount: 8 },
    { id: "4", name: "Sandton Sun Hotel", location: "Sandton, Gauteng", status: "healthy" as const, incidentCount: 1 },
    { id: "5", name: "Waterfront Lodge", location: "Cape Town, Western Cape", status: "degraded" as const, incidentCount: 4 },
    { id: "6", name: "Kruger Park Lodge", location: "Mpumalanga", status: "healthy" as const, incidentCount: 0 },
    { id: "7", name: "Plettenberg Bay Resort", location: "Plettenberg Bay, Western Cape", status: "healthy" as const, incidentCount: 2 },
    { id: "8", name: "Durban Beachfront Hotel", location: "Durban, KwaZulu-Natal", status: "degraded" as const, incidentCount: 5 },
  ];

  return (
    <AppLayout
      title="Property Management"
      homeRoute="/admin"
      navSections={navSections}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1">All Properties</h2>
          <p className="text-muted-foreground">Manage properties across your portfolio</p>
        </div>

        <PropertyList 
          properties={properties}
          onPropertyClick={(property) => {
            const propertyWithId = property as PropertyWithId;
            setLocation(`/admin/properties/${propertyWithId.id}`);
          }}
        />
      </div>
    </AppLayout>
  );
}
