import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { OrganizationLogo } from "@/components/OrganizationLogo";
import { useActiveOrganization } from "@/hooks/use-active-organization";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  BarChart3,
  FileText,
  MessageSquare,
  Wifi,
  FileSpreadsheet,
  Clock,
  FolderKanban,
  Users,
} from "lucide-react";

export default function Reports() {
  const { data: activeOrg } = useActiveOrganization();
  const [, setLocation] = useLocation();

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
  ];

  return (
    <AppLayout
      title="Reports"
      homeRoute="/manager"
      navSections={navSections}
      sidebarHeader={activeOrg && <OrganizationLogo organizationId={activeOrg.id} />}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-1">Reports & Analytics</h2>
          <p className="text-muted-foreground">
            Generate detailed reports with filtering, sorting, and export capabilities
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
