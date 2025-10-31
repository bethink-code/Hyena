import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { OrganizationLogo } from "@/components/OrganizationLogo";
import { useActiveOrganization } from "@/hooks/use-active-organization";
import { HOTEL_MANAGER_NAV } from "@/config/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  Building2,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { Incident } from "@shared/schema";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from "recharts";

export default function AnalyticsReports() {
  const { data: activeOrg } = useActiveOrganization();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Fetch real incidents data
  const { data: incidents = [] } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
  });

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
      navSections={HOTEL_MANAGER_NAV}
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
              <h3 className="text-xl font-semibold mb-1">Regional Performance</h3>
              <p className="text-muted-foreground text-sm">
                Analytics and insights across your regional properties
              </p>
            </div>

            {/* Regional Property Comparison */}
            <Card className="hover-elevate cursor-pointer" onClick={() => setLocation("/hotel-manager/reports/property-comparison")}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Property Comparison Overview</span>
                  <Badge variant="outline" className="text-xs">Click to view report</Badge>
                </CardTitle>
                <CardDescription>Active incidents across all regional properties</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: "Table Bay", total: incidents.filter(i => i.propertyId === "1").length, critical: incidents.filter(i => i.propertyId === "1" && i.priority === "critical").length },
                    { name: "Umhlanga", total: incidents.filter(i => i.propertyId === "2").length, critical: incidents.filter(i => i.propertyId === "2" && i.priority === "critical").length },
                    { name: "Saxon", total: incidents.filter(i => i.propertyId === "3").length, critical: incidents.filter(i => i.propertyId === "3" && i.priority === "critical").length },
                    { name: "Sandton Sun", total: incidents.filter(i => i.propertyId === "4").length, critical: incidents.filter(i => i.propertyId === "4" && i.priority === "critical").length },
                    { name: "Waterfront", total: incidents.filter(i => i.propertyId === "5").length, critical: incidents.filter(i => i.propertyId === "5" && i.priority === "critical").length },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                    <Legend />
                    <Bar dataKey="total" fill="hsl(var(--primary))" name="Total Incidents" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="critical" fill="hsl(var(--destructive))" name="Critical" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Regional KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Properties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                  <p className="text-xs text-muted-foreground">Under management</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg Response Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">28 min</div>
                  <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    8% improvement
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Resolution Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">91%</div>
                  <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    2% increase
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Incidents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{incidents.filter(i => i.status !== "resolved" && i.status !== "cancelled").length}</div>
                  <p className="text-xs text-muted-foreground">Across all properties</p>
                </CardContent>
              </Card>
            </div>
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
