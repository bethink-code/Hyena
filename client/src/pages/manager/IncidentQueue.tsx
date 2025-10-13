import { useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { PropertyList } from "@/components/PropertyList";
import { PROPERTIES } from "@/lib/properties";
import type { Incident } from "@shared/schema";
import {
  LayoutDashboard,
  AlertTriangle,
  BarChart3,
  FileText,
  MessageSquare,
  Wifi,
} from "lucide-react";

export default function IncidentQueue() {
  const [, setLocation] = useLocation();
  
  // Use the first 3 properties for the manager's scope
  const managerProperties = PROPERTIES.slice(0, 3);

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

  // Fetch all incidents from the API
  const { data: allIncidents = [] } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
  });

  // Calculate incident metrics per property based on real API data
  const propertiesWithIncidentMetrics = useMemo(() => {
    return managerProperties.map(property => {
      // Filter incidents for this property
      const propertyIncidents = allIncidents.filter(i => i.propertyId === property.id);
      
      // Calculate metrics
      const activeIncidents = propertyIncidents.filter(i => i.status !== 'resolved').length;
      const criticalIncidents = propertyIncidents.filter(i => 
        i.status !== 'resolved' && i.priority === 'critical'
      ).length;
      
      // Count new incidents (created in the last hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const newIncidents = propertyIncidents.filter(i => 
        i.status !== 'resolved' && new Date(i.createdAt) > oneHourAgo
      ).length;

      // Determine overall status based on incident data
      let status: "healthy" | "degraded" | "critical" | "offline" = "healthy";
      if (criticalIncidents >= 3) {
        status = "critical";
      } else if (criticalIncidents >= 1 || activeIncidents >= 5) {
        status = "degraded";
      } else if (activeIncidents >= 3) {
        status = "degraded";
      }

      return {
        ...property,
        status,
        incidentCount: activeIncidents,
        criticalCount: criticalIncidents,
        newCount: newIncidents,
      };
    });
  }, [managerProperties, allIncidents]);

  return (
    <AppLayout
      title="Incident Queue"
      homeRoute="/manager"
      navSections={navSections}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-1">Incident Management</h2>
          <p className="text-muted-foreground">Monitor and manage all incidents across your properties</p>
        </div>

        <PropertyList
          properties={propertiesWithIncidentMetrics}
          onPropertyClick={(property) => {
            if (property.id) {
              setLocation(`/manager/properties/${property.id}`);
            }
          }}
        />
      </div>
    </AppLayout>
  );
}
