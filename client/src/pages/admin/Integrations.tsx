import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Building,
} from "lucide-react";

export default function Integrations() {
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

  const integrations = [
    { name: "Slack Notifications", description: "Send alerts to Slack channels", status: "active" },
    { name: "Email System", description: "SMTP email delivery", status: "active" },
    { name: "SMS Alerts", description: "Twilio SMS integration", status: "inactive" },
    { name: "Webhook API", description: "Custom webhook endpoints", status: "active" },
  ];

  return (
    <AppLayout
      title="Integrations"
      homeRoute="/admin"
      navSections={navSections}
    >
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">Integrations</h2>
          <p className="text-muted-foreground">Connect external services and APIs</p>
        </div>

        <div className="grid gap-4">
          {integrations.map((integration, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{integration.name}</CardTitle>
                    <CardDescription>{integration.description}</CardDescription>
                  </div>
                  <Badge 
                    variant={integration.status === "active" ? "default" : "outline"}
                    data-testid={`badge-status-${index}`}
                  >
                    {integration.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" data-testid={`button-configure-${index}`}>
                  Configure
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
