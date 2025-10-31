import { useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { OrganizationLogo } from "@/components/OrganizationLogo";
import { useActiveOrganization } from "@/hooks/use-active-organization";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutDashboard,
  AlertTriangle,
  BarChart3,
  MessageSquare,
  Wifi,
  Building2,
  TrendingUp,
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

  const navSections = [
    {
      label: "Main",
      items: [
        { title: "Dashboard", href: "/hotel-manager", icon: LayoutDashboard },
        { title: "Incidents", href: "/hotel-manager/incidents", icon: AlertTriangle },
        { title: "Network Status", href: "/hotel-manager/network", icon: Wifi },
      ],
    },
    {
      label: "Analysis",
      items: [
        { title: "Analytics & Reports", href: "/hotel-manager/analytics", icon: BarChart3 },
      ],
    },
    {
      label: "Communication",
      items: [
        { title: "Guest Messages", href: "/hotel-manager/messages", icon: MessageSquare },
      ],
    },
  ];

  const reports = [
    {
      id: "property-comparison",
      title: "Property Comparison Report",
      description: "Compare incident metrics across all properties in your portfolio",
      icon: Building2,
      route: "/hotel-manager/reports/property-comparison",
    },
    {
      id: "regional-trends",
      title: "Regional Trends Report",
      description: "Identify patterns and trends across your regional properties",
      icon: TrendingUp,
      route: "/hotel-manager/reports/regional-trends",
    },
    {
      id: "resource-utilization",
      title: "Resource Utilization Report",
      description: "Analyze technician allocation and workload distribution",
      icon: Users,
      route: "/hotel-manager/reports/resource-utilization",
    },
    {
      id: "user-feedback",
      title: "User Feedback Report",
      description: "Centralized view of all user comments and feedback across the platform",
      icon: MessageSquare,
      route: "/hotel-manager/reports/user-feedback",
    },
    {
      id: "network-infrastructure",
      title: "Network Infrastructure Report",
      description: "Real-time network monitoring across your regional portfolio of properties",
      icon: Activity,
      route: "http://129.232.224.154:5101/",
      external: true,
    },
  ];

  return (
    <AppLayout
      title="Analytics & Reports"
      navSections={navSections}
      homeRoute="/hotel-manager"
      sidebarHeader={activeOrg && <OrganizationLogo organizationId={activeOrg.id} />}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-1">Analytics & Reports</h2>
          <p className="text-muted-foreground">
            Regional insights and comprehensive reporting for multi-property analysis
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
              <h3 className="text-xl font-semibold mb-1">Performance Metrics</h3>
              <p className="text-muted-foreground text-sm">
                Analytics and insights across your regional properties
              </p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Regional Performance Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Analytics and insights for The Table Bay Hotel</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="mt-6 space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-1">Available Reports</h3>
              <p className="text-muted-foreground text-sm">
                Comprehensive reports for multi-property analysis and comparison
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
