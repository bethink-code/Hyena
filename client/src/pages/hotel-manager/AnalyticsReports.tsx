import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { OrganizationLogo } from "@/components/OrganizationLogo";
import { useActiveOrganization } from "@/hooks/use-active-organization";
import { HOTEL_MANAGER_NAV } from "@/config/navigation";
import { getPropertyById } from "@/lib/properties";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Activity,
  ExternalLink,
  PieChart as PieChartIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { Incident } from "@shared/schema";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { format, subDays, startOfDay } from "date-fns";

export default function AnalyticsReports() {
  const { data: activeOrg } = useActiveOrganization();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");

  // PROTOTYPE NOTE: In production, propertyId would come from authenticated user session
  const propertyId = "1";
  const property = getPropertyById(propertyId);

  // Fetch real incidents data
  const { data: allIncidents = [] } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
  });

  // Filter to this property only
  const incidents = useMemo(() => {
    return allIncidents.filter(i => i.propertyId === propertyId);
  }, [allIncidents, propertyId]);

  // Calculate property-specific metrics
  const propertyMetrics = useMemo(() => {
    const activeIncidents = incidents.filter(i => 
      i.status !== 'resolved' && 
      i.status !== 'cancelled' && 
      i.status !== 'duplicate'
    );
    
    const resolvedIncidents = incidents.filter(i => i.status === 'resolved');
    const criticalIncidents = activeIncidents.filter(i => i.priority === 'critical');
    
    // Average response time (mock calculation)
    const avgResponseTime = 32; // minutes
    
    // Resolution rate
    const totalIncidents = incidents.length;
    const resolutionRate = totalIncidents > 0 
      ? Math.round((resolvedIncidents.length / totalIncidents) * 100) 
      : 0;

    return {
      activeIncidents: activeIncidents.length,
      criticalIncidents: criticalIncidents.length,
      avgResponseTime,
      resolutionRate,
    };
  }, [incidents]);

  // Incident trends over last 7 days
  const trendData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayStart = startOfDay(date);
      const dayIncidents = incidents.filter(inc => {
        const incDate = startOfDay(new Date(inc.createdAt));
        return incDate.getTime() === dayStart.getTime();
      });
      
      return {
        date: format(date, 'MMM dd'),
        incidents: dayIncidents.length,
        critical: dayIncidents.filter(i => i.priority === 'critical').length,
      };
    });
    
    return last7Days;
  }, [incidents]);

  // Incident breakdown by category
  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    incidents.forEach(inc => {
      const cat = inc.category || 'Other';
      categories[cat] = (categories[cat] || 0) + 1;
    });
    
    return Object.entries(categories).map(([name, value]) => ({
      name,
      value,
    }));
  }, [incidents]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const reports = [
    {
      id: "user-feedback",
      title: "User Feedback Report",
      description: `Guest and staff feedback for ${property?.name}`,
      icon: MessageSquare,
      route: "/hotel-manager/reports/user-feedback",
    },
    {
      id: "network-infrastructure",
      title: "Network Infrastructure Report",
      description: `Real-time network monitoring for ${property?.name}`,
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
            Property insights and performance analytics for {property?.name}
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
              <h3 className="text-xl font-semibold mb-1">Property Performance</h3>
              <p className="text-muted-foreground text-sm">
                Analytics and insights for {property?.name}
              </p>
            </div>

            {/* Property KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Incidents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{propertyMetrics.activeIncidents}</div>
                  <p className="text-xs text-muted-foreground">Currently active</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Critical Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{propertyMetrics.criticalIncidents}</div>
                  <p className="text-xs text-muted-foreground">Require immediate attention</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg Response Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{propertyMetrics.avgResponseTime} min</div>
                  <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    5% improvement
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Resolution Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{propertyMetrics.resolutionRate}%</div>
                  <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {property?.name}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Incident Trends Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Incident Trends (Last 7 Days)</CardTitle>
                <CardDescription>Daily incident volume and critical issues</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                    <Legend />
                    <Bar dataKey="incidents" fill="hsl(var(--primary))" name="Total Incidents" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="critical" fill="hsl(var(--destructive))" name="Critical" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Incident Category Breakdown */}
            {categoryData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Incident Category Breakdown
                  </CardTitle>
                  <CardDescription>Distribution of incidents by type</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reports" className="mt-6 space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-1">Available Reports</h3>
              <p className="text-muted-foreground text-sm">
                Detailed reports for {property?.name}
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
