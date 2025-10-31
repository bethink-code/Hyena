import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { OrganizationLogo } from "@/components/OrganizationLogo";
import { useActiveOrganization } from "@/hooks/use-active-organization";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LayoutDashboard,
  AlertTriangle,
  BarChart3,
  FileText,
  MessageSquare,
  Wifi,
  Building2,
  TrendingUp,
  Users,
} from "lucide-react";

export default function Reports() {
  const { data: activeOrg } = useActiveOrganization();
  const [, setLocation] = useLocation();

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
        { title: "Analytics", href: "/hotel-manager/analytics", icon: BarChart3 },
        { title: "Reports", href: "/hotel-manager/reports", icon: FileText },
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
  ];

  return (
    <AppLayout
      title="Reports"
      navSections={navSections}
      homeRoute="/hotel-manager"
      sidebarHeader={activeOrg && <OrganizationLogo organizationId={activeOrg.id} />}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-1">Regional Manager Reports</h2>
          <p className="text-muted-foreground">
            Comprehensive reports for multi-property analysis and comparison
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report) => (
            <Card
              key={report.id}
              className="hover-elevate active-elevate-2 cursor-pointer transition-all"
              onClick={() => setLocation(report.route)}
              data-testid={`card-report-${report.id}`}
            >
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <report.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <CardDescription className="mt-2">{report.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
