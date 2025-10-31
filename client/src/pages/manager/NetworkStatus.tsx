import { useMemo } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { OrganizationLogo } from "@/components/OrganizationLogo";
import { useActiveOrganization } from "@/hooks/use-active-organization";
import { PropertyList } from "@/components/PropertyList";
import { PROPERTIES } from "@/lib/properties";
import {
  LayoutDashboard,
  AlertTriangle,
  BarChart3,
  FileText,
  MessageSquare,
  Wifi,
} from "lucide-react";

export default function NetworkStatus() {
  const { data: activeOrg } = useActiveOrganization();
  const [, setLocation] = useLocation();
  
  // Use the first 3 properties for the manager's scope
  const managerProperties = PROPERTIES.slice(0, 3);

  const navSections = [
    {
      label: "Main",
      items: [
        { title: "Incidents", href: "/manager", icon: AlertTriangle },
        { title: "Network Status", href: "/manager/network", icon: Wifi },
      ],
    },
    {
      label: "Analysis",
      items: [
        { title: "Analytics", href: "/manager/analytics", icon: BarChart3 },
        { title: "Analytics & Reports", href: "/manager/analytics", icon: FileText },
      ],
    },
  ];

  // Mock network device data for each property
  const networkDevicesByProperty: Record<string, Array<{ name: string; status: "healthy" | "degraded" | "critical" | "offline"; uptime: string }>> = {
    "1": [
      { name: "Main Router", status: "healthy", uptime: "99.8%" },
      { name: "Access Point - Lobby", status: "healthy", uptime: "99.5%" },
      { name: "Access Point - Floor 2", status: "healthy", uptime: "99.2%" },
      { name: "Access Point - Floor 3", status: "healthy", uptime: "99.9%" },
      { name: "Switch - Main", status: "healthy", uptime: "100%" },
    ],
    "2": [
      { name: "Main Router", status: "healthy", uptime: "98.5%" },
      { name: "Access Point - Lobby", status: "degraded", uptime: "92.1%" },
      { name: "Access Point - Floor 2", status: "degraded", uptime: "95.2%" },
      { name: "Access Point - Floor 3", status: "healthy", uptime: "99.3%" },
      { name: "Switch - Main", status: "healthy", uptime: "99.7%" },
    ],
    "3": [
      { name: "Main Router", status: "critical", uptime: "85.2%" },
      { name: "Access Point - Lobby", status: "degraded", uptime: "91.8%" },
      { name: "Access Point - Floor 2", status: "critical", uptime: "82.5%" },
      { name: "Access Point - Floor 3", status: "degraded", uptime: "93.1%" },
      { name: "Switch - Main", status: "degraded", uptime: "94.3%" },
    ],
  };

  // Calculate network health status for each property
  const propertiesWithNetworkHealth = useMemo(() => {
    return managerProperties.map(property => {
      const devices = networkDevicesByProperty[property.id] || [];
      
      // Calculate health based on device statuses
      const criticalCount = devices.filter(d => d.status === "critical").length;
      const degradedCount = devices.filter(d => d.status === "degraded").length;
      const healthyCount = devices.filter(d => d.status === "healthy").length;
      const offlineCount = devices.filter(d => d.status === "offline").length;
      
      // Determine overall network health status
      let networkStatus: "healthy" | "degraded" | "critical" | "offline" = "healthy";
      if (offlineCount > 0 || criticalCount >= 2) {
        networkStatus = "critical";
      } else if (criticalCount >= 1 || degradedCount >= 2) {
        networkStatus = "degraded";
      } else if (degradedCount >= 1) {
        networkStatus = "degraded";
      }

      // Count network issues as incident count for the card
      const incidentCount = criticalCount + degradedCount + offlineCount;
      const criticalIncidentCount = criticalCount + offlineCount;

      return {
        ...property,
        status: networkStatus,
        incidentCount,
        criticalCount: criticalIncidentCount,
        newCount: 0,
      };
    });
  }, [managerProperties]);

  return (
    <AppLayout
      title="Network Status"
      homeRoute="/manager"
      navSections={navSections}
      sidebarHeader={activeOrg && <OrganizationLogo organizationId={activeOrg.id} />}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-1">Network Health Overview</h2>
          <p className="text-muted-foreground">Monitor network infrastructure across all properties</p>
        </div>

        <PropertyList
          properties={propertiesWithNetworkHealth}
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
