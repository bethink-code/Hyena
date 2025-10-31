import { AppLayout } from "@/components/AppLayout";
import { HyenaLogo } from "@/components/HyenaLogo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ADMIN_NAV } from "@/config/navigation";

export default function Integrations() {
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
      navSections={ADMIN_NAV}
      sidebarHeader={<HyenaLogo />}
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
