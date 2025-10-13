import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { PropertyList } from "@/components/PropertyList";
import { PROPERTIES } from "@/lib/properties";
import type { Incident } from "@shared/schema";
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

  // Fetch all incidents to calculate incident counts per property
  const { data: allIncidents = [] } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
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

  // Calculate incident counts for each property from actual incidents
  const propertiesWithIncidents = PROPERTIES.map(property => {
    const propertyIncidents = allIncidents.filter(i => i.propertyId === property.id);
    const activeIncidents = propertyIncidents.filter(i => i.status !== 'resolved');
    const incidentCount = activeIncidents.length;
    const criticalCount = activeIncidents.filter(i => i.priority === 'critical').length;
    const newCount = activeIncidents.filter(i => i.status === 'new').length;
    
    return {
      ...property,
      incidentCount,
      criticalCount,
      newCount,
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
