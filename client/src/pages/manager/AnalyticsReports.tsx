import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { OrganizationLogo } from "@/components/OrganizationLogo";
import { useActiveOrganization } from "@/hooks/use-active-organization";
import { PropertyList } from "@/components/PropertyList";
import { PROPERTIES } from "@/lib/properties";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  BarChart3,
  MessageSquare,
  Wifi,
  FileSpreadsheet,
  Clock,
  FolderKanban,
  Users,
  Activity,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AnalyticsReports() {
  const { data: activeOrg } = useActiveOrganization();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  
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
        { title: "Analytics & Reports", href: "/manager/analytics", icon: BarChart3 },
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

  const reports = [
    {
      id: "incident-summary",
      title: "Incident Summary Report",
      description: "Complete overview of all incidents with filtering and export capabilities",
      icon: FileSpreadsheet,
      route: "/manager/reports/incident-summary",
    },
    {
      id: "sla-performance",
      title: "SLA Performance Report",
      description: "Track SLA compliance and resolution times across properties",
      icon: Clock,
      route: "/manager/reports/sla-performance",
    },
    {
      id: "category-analysis",
      title: "Category Analysis Report",
      description: "Breakdown of incidents by category and trends over time",
      icon: FolderKanban,
      route: "/manager/reports/category-analysis",
    },
    {
      id: "guest-impact",
      title: "Guest Impact Report",
      description: "Analysis of incidents affecting guests and service quality",
      icon: Users,
      route: "/manager/reports/guest-impact",
    },
    {
      id: "user-feedback",
      title: "User Feedback Report",
      description: "Centralized view of all user comments and feedback across the platform",
      icon: MessageSquare,
      route: "/manager/reports/user-feedback",
    },
    {
      id: "network-infrastructure",
      title: "Network Infrastructure Report",
      description: "Real-time network device status and monitoring data for your properties",
      icon: Activity,
      route: "http://129.232.224.154:5101/",
      external: true,
    },
  ];

  return (
    <AppLayout
      title="Analytics & Reports"
      homeRoute="/manager"
      navSections={navSections}
      sidebarHeader={activeOrg && <OrganizationLogo organizationId={activeOrg.id} />}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-1">Analytics & Reports</h2>
          <p className="text-muted-foreground">
            Performance insights and detailed reporting across your properties
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="dashboard" data-testid="tab-dashboard">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="reports" data-testid="tab-reports">
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6 space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-1">Performance Analytics</h3>
              <p className="text-muted-foreground text-sm">
                Monitor performance metrics and trends across all properties
              </p>
            </div>
            <PropertyList
              properties={propertiesWithAnalytics}
              onPropertyClick={(property) => {
                if (property.id) {
                  setLocation(`/manager/properties/${property.id}`);
                }
              }}
            />
          </TabsContent>

          <TabsContent value="reports" className="mt-6 space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-1">Available Reports</h3>
              <p className="text-muted-foreground text-sm">
                Generate detailed reports with filtering, sorting, and export capabilities
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reports.map((report) => (
                <Card
                  key={report.id}
                  className="hover-elevate active-elevate-2 cursor-pointer transition-all"
                  onClick={() => {
                    if (report.external) {
                      window.open(report.route, "_blank", "noopener,noreferrer");
                    } else {
                      setLocation(report.route);
                    }
                  }}
                  data-testid={`card-report-${report.id}`}
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <report.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <CardTitle className="text-lg">{report.title}</CardTitle>
                          {report.external && (
                            <Badge variant="default" className="bg-primary text-primary-foreground shrink-0">
                              LIVE DATA
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="mt-2">{report.description}</CardDescription>
                        {report.external && (
                          <div className="mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(report.route, "_blank", "noopener,noreferrer");
                              }}
                              data-testid="button-aruba-network-poc"
                            >
                              Open Network POC
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
