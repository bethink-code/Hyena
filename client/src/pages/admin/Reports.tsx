import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Building2,
  Users as UsersIcon,
  Settings,
  BarChart3,
  FileText,
  Puzzle,
  Shield,
  Download,
  Building,
} from "lucide-react";

export default function Reports() {
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
        { title: "Reports", href: "/admin/reports", icon: FileText },
        { title: "Audit Logs", href: "/admin/audit", icon: Shield },
      ],
    },
  ];

  const reports = [
    { name: "Quarterly Performance Report", date: "01/10/2025", properties: "All", format: "PDF" },
    { name: "Monthly Incident Summary", date: "01/10/2025", properties: "All", format: "PDF" },
    { name: "Regional Comparison Report", date: "25/09/2025", properties: "Regional", format: "PDF" },
    { name: "SLA Compliance Report", date: "15/09/2025", properties: "All", format: "PDF" },
  ];

  return (
    <AppLayout
      title="Reports"
      homeRoute="/admin"
      navSections={navSections}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">System Reports</h2>
          <p className="text-muted-foreground">Portfolio-wide reporting and documentation</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Available Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.map((report, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-md">
                  <div className="space-y-1">
                    <div className="font-medium">{report.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Generated: {report.date} • Scope: {report.properties}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" data-testid={`button-download-${index}`}>
                    <Download className="h-4 w-4 mr-2" />
                    Download {report.format}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
