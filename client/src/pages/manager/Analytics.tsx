import { useMemo } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { PropertyList } from "@/components/PropertyList";
import { PROPERTIES } from "@/lib/properties";
import {
  AlertTriangle,
  BarChart3,
  FileText,
  MessageSquare,
  Wifi,
} from "lucide-react";

export default function Analytics() {
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

  // Mock analytics data for each property
  const analyticsByProperty: Record<string, {
    avgResponseTime: number;
    resolutionRate: number;
    guestSatisfaction: number;
    totalIncidents: number;
    trend: "up" | "down";
  }> = {
    "1": {
      avgResponseTime: 23,
      resolutionRate: 94,
      guestSatisfaction: 4.6,
      totalIncidents: 42,
      trend: "down",
    },
    "2": {
      avgResponseTime: 35,
      resolutionRate: 88,
      guestSatisfaction: 4.2,
      totalIncidents: 58,
      trend: "up",
    },
    "3": {
      avgResponseTime: 48,
      resolutionRate: 78,
      guestSatisfaction: 3.8,
      totalIncidents: 72,
      trend: "up",
    },
  };

  // Calculate analytics status for each property
  const propertiesWithAnalytics = useMemo(() => {
    return managerProperties.map(property => {
      const analytics = analyticsByProperty[property.id] || {
        avgResponseTime: 30,
        resolutionRate: 90,
        guestSatisfaction: 4.0,
        totalIncidents: 50,
        trend: "down",
      };
      
      // Calculate status based on performance metrics
      let analyticsStatus: "healthy" | "degraded" | "critical" | "offline" = "healthy";
      
      // Critical if multiple metrics are poor
      if (
        (analytics.avgResponseTime > 45 && analytics.resolutionRate < 80) ||
        analytics.guestSatisfaction < 4.0
      ) {
        analyticsStatus = "critical";
      } 
      // Degraded if some metrics need attention
      else if (
        analytics.avgResponseTime > 30 ||
        analytics.resolutionRate < 90 ||
        analytics.guestSatisfaction < 4.5
      ) {
        analyticsStatus = "degraded";
      }

      // Use total incidents as incident count
      const incidentCount = analytics.totalIncidents;
      
      // Critical incidents based on response time and resolution rate
      const criticalCount = analytics.avgResponseTime > 45 || analytics.resolutionRate < 80 ? 
        Math.floor(analytics.totalIncidents * 0.3) : 
        Math.floor(analytics.totalIncidents * 0.1);

      return {
        ...property,
        status: analyticsStatus,
        incidentCount,
        criticalCount,
        newCount: analytics.trend === "up" ? Math.floor(analytics.totalIncidents * 0.15) : 0,
      };
    });
  }, [managerProperties]);

  return (
    <AppLayout
      title="Analytics"
      homeRoute="/manager"
      navSections={navSections}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-1">Performance Analytics</h2>
          <p className="text-muted-foreground">Monitor performance metrics and trends across all properties</p>
        </div>

        <PropertyList
          properties={propertiesWithAnalytics}
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
