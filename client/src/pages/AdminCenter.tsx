import { AppLayout } from "@/components/AppLayout";
import { HyenaLogo } from "@/components/HyenaLogo";
import { PropertyList } from "@/components/PropertyList";
import { KPIWidget } from "@/components/KPIWidget";
import { ReportIncidentDialog } from "@/components/ReportIncidentDialog";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { Incident } from "@shared/schema";
import { ADMIN_NAV } from "@/config/navigation";
import {
  Building2,
  AlertTriangle,
  TrendingUp,
  Users as UsersIcon,
} from "lucide-react";

export default function AdminCenter() {
  const [, setLocation] = useLocation();
  
  // Fetch all incidents to calculate property-specific incident counts
  const { data: incidents = [] } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
  });

  // Define all properties in the portfolio
  const propertyDefinitions = [
    { id: "1", name: "The Table Bay Hotel", location: "Cape Town, Western Cape" },
    { id: "2", name: "Umhlanga Sands Resort", location: "Durban, KwaZulu-Natal" },
    { id: "3", name: "Saxon Hotel", location: "Johannesburg, Gauteng" },
    { id: "4", name: "Sandton Sun Hotel", location: "Sandton, Gauteng" },
    { id: "5", name: "Waterfront Lodge", location: "Cape Town, Western Cape" },
    { id: "6", name: "Kruger Park Lodge", location: "Mpumalanga" },
  ];

  // Determine property status based on incident count and priority
  const getPropertyStatus = (propertyId: string): "healthy" | "degraded" | "critical" | "offline" => {
    // Active incidents = exclude terminal statuses (resolved, cancelled, duplicate)
    const propertyIncidents = incidents.filter(i => 
      i.propertyId === propertyId && 
      i.status !== 'resolved' && 
      i.status !== 'cancelled' && 
      i.status !== 'duplicate'
    );
    const hasCritical = propertyIncidents.some(i => i.priority === 'critical');
    const activeCount = propertyIncidents.length;

    if (hasCritical) return "critical";
    if (activeCount > 3) return "degraded";
    if (activeCount > 0) return "degraded";
    return "healthy";
  };

  // Build properties array with real-time data including critical and new counts
  const properties = propertyDefinitions.map(prop => {
    const propertyIncidents = incidents.filter(i => i.propertyId === prop.id);
    // Active incidents = exclude terminal statuses (resolved, cancelled, duplicate)
    const activeIncidents = propertyIncidents.filter(i => 
      i.status !== 'resolved' && 
      i.status !== 'cancelled' && 
      i.status !== 'duplicate'
    );
    const incidentCount = activeIncidents.length;
    const criticalCount = activeIncidents.filter(i => i.priority === 'critical').length;
    const newCount = activeIncidents.filter(i => i.status === 'new').length;
    
    return {
      id: prop.id,
      name: prop.name,
      location: prop.location,
      status: getPropertyStatus(prop.id),
      incidentCount,
      criticalCount,
      newCount,
    };
  });

  // Calculate total active incidents (exclude terminal statuses: resolved, cancelled, duplicate)
  const totalActiveIncidents = incidents.filter(i => 
    i.status !== 'resolved' && 
    i.status !== 'cancelled' && 
    i.status !== 'duplicate'
  ).length;

  return (
    <AppLayout
      title="Platform Administration Center"
      homeRoute="/admin"
      notificationCount={2}
      navSections={ADMIN_NAV}
      sidebarHeader={<HyenaLogo />}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Portfolio Overview</h2>
            <p className="text-muted-foreground">Multi-property health and performance metrics</p>
          </div>
          <ReportIncidentDialog />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPIWidget 
            title="Total Properties" 
            value={propertyDefinitions.length} 
            icon={Building2} 
            onClick={() => setLocation('/admin/properties')}
          />
          <KPIWidget
            title="Active Incidents"
            value={totalActiveIncidents}
            change={0}
            trend="down"
            icon={AlertTriangle}
            onClick={() => setLocation('/admin/incidents')}
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
            onClick={() => setLocation('/admin/users')}
          />
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Property Status</h3>
          <PropertyList
            properties={properties}
            onPropertyClick={(property) => setLocation(`/admin/incidents?propertyId=${property.id}`)}
          />
        </div>
      </div>
    </AppLayout>
  );
}
