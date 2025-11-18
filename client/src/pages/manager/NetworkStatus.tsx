import { useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { OrganizationLogo } from "@/components/OrganizationLogo";
import { useActiveOrganization } from "@/hooks/use-active-organization";
import { PropertyList } from "@/components/PropertyList";
import { PROPERTIES } from "@/lib/properties";
import { MANAGER_NAV } from "@/config/navigation";
import type { Incident } from "@shared/schema";

export default function NetworkStatus() {
  const { data: activeOrg } = useActiveOrganization();
  const [, setLocation] = useLocation();
  
  // Use the first 3 properties for the manager's scope
  const managerProperties = PROPERTIES.slice(0, 3);

  // Fetch real incidents data
  const { data: allIncidents = [] } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
  });

  // Calculate network health status for each property based on real incidents
  const propertiesWithNetworkHealth = useMemo(() => {
    return managerProperties.map(property => {
      // Filter active alerts (informational status updates) for this property
      const propertyIncidents = allIncidents.filter(i => 
        i.propertyId === property.id &&
        i.itemType === 'alert' && // Only show alerts on Network Status
        i.status !== 'resolved' && 
        i.status !== 'cancelled' && 
        i.status !== 'duplicate'
      );
      
      // Count by priority
      const criticalCount = propertyIncidents.filter(i => i.priority === "critical").length;
      const highCount = propertyIncidents.filter(i => i.priority === "high").length;
      
      // Determine overall network health status based on incidents
      let networkStatus: "healthy" | "degraded" | "critical" | "offline" = "healthy";
      if (criticalCount >= 2) {
        networkStatus = "critical";
      } else if (criticalCount >= 1 || highCount >= 2) {
        networkStatus = "degraded";
      } else if (highCount >= 1) {
        networkStatus = "degraded";
      }

      // Total active incidents
      const incidentCount = propertyIncidents.length;

      return {
        ...property,
        status: networkStatus,
        incidentCount,
        criticalCount,
        newCount: 0,
      };
    });
  }, [managerProperties, allIncidents]);

  return (
    <AppLayout
      title="Network Status"
      homeRoute="/manager"
      navSections={MANAGER_NAV}
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
