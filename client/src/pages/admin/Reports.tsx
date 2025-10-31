import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LayoutDashboard,
  Building2,
  Users as UsersIcon,
  Settings,
  BarChart3,
  FileText,
  Puzzle,
  Shield,
  Building,
  GitCompare,
  Wrench,
  Activity,
  MessageSquare,
} from "lucide-react";

export default function Reports() {
  const [, setLocation] = useLocation();

  const navSections = [
    {
      label: "Overview",
      items: [
        { title: "Portfolio Dashboard", href: "/admin", icon: LayoutDashboard },
        { title: "All Properties", href: "/admin/properties", icon: Building2 },
      ],
    },
    {
      label: "Management",
      items: [
        { title: "Organizations", href: "/admin/organizations", icon: Building },
        { title: "Users & Roles", href: "/admin/users", icon: UsersIcon },
        { title: "System Config", href: "/admin/config", icon: Settings },
        { title: "Integrations", href: "/admin/integrations", icon: Puzzle },
      ],
    },
    {
      label: "Reporting",
      items: [
        { title: "Regional Analytics", href: "/admin/analytics", icon: BarChart3 },
        { title: "Analytics & Reports", href: "/admin/reports", icon: FileText },
        { title: "Audit Logs", href: "/admin/audit", icon: Shield },
      ],
    },
  ];

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
      navSections={navSections}
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
