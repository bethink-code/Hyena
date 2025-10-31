import { useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ADMIN_NAV } from "@/config/navigation";
import {
  Building2,
  TrendingUp,
  TrendingDown,
  GitCompare,
  Wrench,
  Activity,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { Incident } from "@shared/schema";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, PieChart, Pie } from "recharts";

export default function AnalyticsReports() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Fetch real incidents data
  const { data: incidents = [] } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
  });

  const reports = [
    {
      id: "portfolio-performance",
      title: "Portfolio Performance Report",
      description: "Comprehensive performance metrics across all organizations and properties",
      icon: BarChart3,
      route: "/admin/reports/portfolio-performance",
    },
    {
      id: "organization-comparison",
      title: "Organization Comparison Report",
      description: "Compare performance and metrics across different organizations",
      icon: GitCompare,
      route: "/admin/reports/organization-comparison",
    },
    {
      id: "technician-fleet",
      title: "Technician Fleet Analysis",
      description: "Analyze technician workload, efficiency, and resource allocation",
      icon: Wrench,
      route: "/admin/reports/technician-fleet",
    },
    {
      id: "system-health",
      title: "System Health Report",
      description: "Overall system status, performance metrics, and incident trends",
      icon: Activity,
      route: "/admin/reports/system-health",
    },
    {
      id: "user-feedback",
      title: "User Feedback Report",
      description: "Centralized view of all user comments and feedback across the platform",
      icon: MessageSquare,
      route: "/admin/reports/user-feedback",
    },
    {
      id: "network-infrastructure",
      title: "Network Infrastructure Report",
      description: "Complete network infrastructure monitoring across all organizations and properties",
      icon: Activity,
      route: "http://129.232.224.154:5101/",
      external: true,
    },
  ];

  return (
    <AppLayout
      title="Analytics & Reports"
      homeRoute="/admin"
      navSections={ADMIN_NAV}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-1">Analytics & Reports</h2>
          <p className="text-muted-foreground">
            Portfolio-wide analytics and comprehensive system reporting
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
              <h3 className="text-xl font-semibold mb-1">Portfolio Analytics</h3>
              <p className="text-muted-foreground text-sm">
                Performance metrics across all organizations and properties
              </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">Across 3 organizations</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                  <TrendingDown className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">18 min</div>
                  <p className="text-xs text-muted-foreground">-22% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">96%</div>
                  <p className="text-xs text-muted-foreground">+4% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
                  <TrendingDown className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{incidents.filter(i => i.status !== "resolved" && i.status !== "cancelled").length}</div>
                  <p className="text-xs text-muted-foreground">Portfolio-wide</p>
                </CardContent>
              </Card>
            </div>

            {/* Portfolio-wide Property Comparison */}
            <Card className="hover-elevate cursor-pointer" onClick={() => setLocation("/admin/reports/portfolio-performance")}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Portfolio-wide Incident Distribution</span>
                  <Badge variant="outline" className="text-xs">Click to view report</Badge>
                </CardTitle>
                <CardDescription>Incidents across all properties in the portfolio</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={[
                    { name: "Table Bay", total: incidents.filter(i => i.propertyId === "1").length, critical: incidents.filter(i => i.propertyId === "1" && i.priority === "critical").length },
                    { name: "Umhlanga", total: incidents.filter(i => i.propertyId === "2").length, critical: incidents.filter(i => i.propertyId === "2" && i.priority === "critical").length },
                    { name: "Saxon", total: incidents.filter(i => i.propertyId === "3").length, critical: incidents.filter(i => i.propertyId === "3" && i.priority === "critical").length },
                    { name: "Sandton", total: incidents.filter(i => i.propertyId === "4").length, critical: incidents.filter(i => i.propertyId === "4" && i.priority === "critical").length },
                    { name: "Waterfront", total: incidents.filter(i => i.propertyId === "5").length, critical: incidents.filter(i => i.propertyId === "5" && i.priority === "critical").length },
                    { name: "Kruger", total: incidents.filter(i => i.propertyId === "6").length, critical: incidents.filter(i => i.propertyId === "6" && i.priority === "critical").length },
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

            {/* System Health Metrics */}
            <Card className="hover-elevate cursor-pointer" onClick={() => setLocation("/admin/reports/system-health")}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>System Health Overview</span>
                  <Badge variant="outline" className="text-xs">Click to view report</Badge>
                </CardTitle>
                <CardDescription>Platform-wide incident status distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "New", value: incidents.filter(i => i.status === "new").length, fill: "hsl(var(--chart-1))" },
                          { name: "Assigned", value: incidents.filter(i => i.status === "assigned").length, fill: "hsl(var(--chart-2))" },
                          { name: "In Progress", value: incidents.filter(i => i.status === "in_progress").length, fill: "hsl(var(--chart-3))" },
                          { name: "On Hold", value: incidents.filter(i => i.status === "on_hold").length, fill: "hsl(var(--chart-4))" },
                          { name: "Resolved", value: incidents.filter(i => i.status === "resolved").length, fill: "hsl(var(--chart-5))" },
                        ].filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        dataKey="value"
                      />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col justify-center space-y-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Total Incidents</div>
                      <div className="text-3xl font-bold">{incidents.length}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Critical Priority</div>
                      <div className="text-2xl font-bold text-destructive">{incidents.filter(i => i.priority === "critical").length}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Resolution Rate</div>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {incidents.length > 0 ? Math.round((incidents.filter(i => i.status === "resolved").length / incidents.length) * 100) : 0}%
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="mt-6 space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-1">Available Reports</h3>
              <p className="text-muted-foreground text-sm">
                Portfolio-wide analytics and comprehensive system reporting
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
