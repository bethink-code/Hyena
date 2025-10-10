import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { PropertyList } from "@/components/PropertyList";
import { PROPERTIES } from "@/lib/properties";
import type { Event } from "@shared/schema";
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

export default function Properties() {
  const [, setLocation] = useLocation();

  // Fetch all events to calculate incident counts per property
  const { data: allEvents = [] } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

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

  // Calculate incident counts for each property from actual events
  const propertiesWithIncidents = PROPERTIES.map(property => {
    const propertyEvents = allEvents.filter(e => e.propertyId === property.id);
    const incidentCount = propertyEvents.filter(e => e.status !== 'resolved').length;
    return {
      ...property,
      incidentCount,
    };
  });

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
          properties={propertiesWithIncidents}
          onPropertyClick={(property) => {
            if (property.id) {
              setLocation(`/admin/properties/${property.id}`);
            }
          }}
        />
      </div>
    </AppLayout>
  );
}
