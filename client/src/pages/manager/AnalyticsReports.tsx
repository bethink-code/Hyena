import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { OrganizationLogo } from "@/components/OrganizationLogo";
import { useActiveOrganization } from "@/hooks/use-active-organization";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MANAGER_NAV } from "@/config/navigation";
import {
  FileSpreadsheet,
  Clock,
  FolderKanban,
  Users,
  Activity,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { Incident } from "@shared/schema";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

export default function AnalyticsReports() {
  const { data: activeOrg } = useActiveOrganization();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Fetch real incidents data
  const { data: incidents = [] } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
  });

  // Filter incidents for manager's properties (1, 2, 3)
  const managerIncidents = useMemo(() => {
    return incidents.filter(i => ["1", "2", "3"].includes(i.propertyId || ""));
  }, [incidents]);

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
      navSections={MANAGER_NAV}
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

            {/* Property Performance Comparison Chart */}
            <Card className="hover-elevate cursor-pointer" onClick={() => setLocation("/manager/reports/incident-summary")}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Incidents by Property</span>
                  <Badge variant="outline" className="text-xs">Click to view report</Badge>
                </CardTitle>
                <CardDescription>Active incident distribution across your properties</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: "Table Bay Hotel", active: managerIncidents.filter(i => i.propertyId === "1" && i.status !== "resolved" && i.status !== "cancelled").length, critical: managerIncidents.filter(i => i.propertyId === "1" && i.priority === "critical" && i.status !== "resolved").length },
                    { name: "Umhlanga Sands", active: managerIncidents.filter(i => i.propertyId === "2" && i.status !== "resolved" && i.status !== "cancelled").length, critical: managerIncidents.filter(i => i.propertyId === "2" && i.priority === "critical" && i.status !== "resolved").length },
                    { name: "Saxon Hotel", active: managerIncidents.filter(i => i.propertyId === "3" && i.status !== "resolved" && i.status !== "cancelled").length, critical: managerIncidents.filter(i => i.propertyId === "3" && i.priority === "critical" && i.status !== "resolved").length },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                    <Legend />
                    <Bar dataKey="active" fill="hsl(var(--primary))" name="Active Incidents" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="critical" fill="hsl(var(--destructive))" name="Critical" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Incident Categories Breakdown */}
            <Card className="hover-elevate cursor-pointer" onClick={() => setLocation("/manager/reports/category-analysis")}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Incidents by Category</span>
                  <Badge variant="outline" className="text-xs">Click to view report</Badge>
                </CardTitle>
                <CardDescription>Distribution of incidents across different categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Connectivity", value: managerIncidents.filter(i => i.category === "connectivity").length, fill: "hsl(var(--chart-1))" },
                        { name: "Performance", value: managerIncidents.filter(i => i.category === "performance").length, fill: "hsl(var(--chart-2))" },
                        { name: "Hardware", value: managerIncidents.filter(i => i.category === "hardware").length, fill: "hsl(var(--chart-3))" },
                        { name: "Security", value: managerIncidents.filter(i => i.category === "security").length, fill: "hsl(var(--chart-4))" },
                        { name: "Other", value: managerIncidents.filter(i => !i.category || !["connectivity", "performance", "hardware", "security"].includes(i.category)).length, fill: "hsl(var(--chart-5))" },
                      ].filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      dataKey="value"
                    >
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* SLA Performance Metrics */}
            <Card className="hover-elevate cursor-pointer" onClick={() => setLocation("/manager/reports/sla-performance")}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>SLA Performance Trend</span>
                  <Badge variant="outline" className="text-xs">Click to view report</Badge>
                </CardTitle>
                <CardDescription>Resolution rate and response time trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Avg Response Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">23 min</div>
                      <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        12% improvement
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Resolution Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">94%</div>
                      <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        3% increase
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Guest Satisfaction</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">4.6/5</div>
                      <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        0.3 point gain
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
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
