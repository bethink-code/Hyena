import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { HyenaLogo } from "@/components/HyenaLogo";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ADMIN_NAV } from "@/config/navigation";
import {
  BarChart3,
  GitCompare,
  Wrench,
  Activity,
  MessageSquare,
} from "lucide-react";

export default function Reports() {
  const [, setLocation] = useLocation();

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
  ];

  return (
    <AppLayout
      title="Reports"
      homeRoute="/admin"
      navSections={ADMIN_NAV}
      sidebarHeader={<HyenaLogo />}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-1">Platform Reports</h2>
          <p className="text-muted-foreground">
            Portfolio-wide analytics and comprehensive system reporting
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
