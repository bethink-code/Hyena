import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ADMIN_NAV } from "@/config/navigation";

export default function Audit() {
  const auditLogs = [
    { action: "User Created", user: "admin@hyena.net", target: "sarah@hotel.com", timestamp: "09/10/2025 14:23" },
    { action: "Config Changed", user: "admin@hyena.net", target: "Auto-assign: enabled", timestamp: "09/10/2025 12:15" },
    { action: "Property Added", user: "admin@hyena.net", target: "Coastal Retreat", timestamp: "08/10/2025 16:45" },
    { action: "User Login", user: "manager@hotel.com", target: "System Access", timestamp: "08/10/2025 09:30" },
    { action: "Integration Enabled", user: "admin@hyena.net", target: "Slack Notifications", timestamp: "07/10/2025 11:00" },
  ];

  return (
    <AppLayout
      title="Audit Logs"
      homeRoute="/admin"
      navSections={ADMIN_NAV}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">Audit Logs</h2>
          <p className="text-muted-foreground">Track system changes and user activities</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {auditLogs.map((log, index) => (
                <div key={index} className="flex items-start justify-between p-4 border rounded-md">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" data-testid={`badge-action-${index}`}>
                        {log.action}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{log.user}</span>
                    </div>
                    <div className="text-sm">{log.target}</div>
                    <div className="text-xs text-muted-foreground">{log.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
