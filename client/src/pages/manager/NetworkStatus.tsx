import { AppLayout } from "@/components/AppLayout";
import { PropertySelector } from "@/components/PropertySelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  AlertTriangle,
  BarChart3,
  FileText,
  MessageSquare,
  Wifi,
  Activity,
  Server,
  Radio,
} from "lucide-react";

export default function NetworkStatus() {
  const properties = [
    { id: "1", name: "The Table Bay Hotel", location: "Cape Town, Western Cape" },
    { id: "2", name: "Umhlanga Sands Resort", location: "Durban, KwaZulu-Natal" },
    { id: "3", name: "Saxon Hotel", location: "Johannesburg, Gauteng" },
  ];

  const navSections = [
    {
      label: "Main",
      items: [
        { title: "Dashboard", href: "/manager", icon: LayoutDashboard },
        { title: "Incident Queue", href: "/manager/incidents", icon: AlertTriangle },
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

  const networkDevices = [
    { name: "Main Router", status: "healthy", uptime: "99.8%", location: "Server Room" },
    { name: "Access Point - Lobby", status: "healthy", uptime: "99.5%", location: "Ground Floor" },
    { name: "Access Point - Floor 2", status: "degraded", uptime: "95.2%", location: "2nd Floor" },
    { name: "Access Point - Floor 3", status: "healthy", uptime: "99.9%", location: "3rd Floor" },
    { name: "Switch - Main", status: "healthy", uptime: "100%", location: "Server Room" },
  ];

  return (
    <AppLayout
      title="Network Status"
      homeRoute="/manager"
      navSections={navSections}
      sidebarHeader={
        <PropertySelector
          properties={properties}
          onPropertyChange={(id) => console.log("Property changed:", id)}
        />
      }
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">Network Infrastructure</h2>
          <p className="text-muted-foreground">Real-time status of all network devices</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Network Health</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98.5%</div>
              <p className="text-xs text-muted-foreground">Overall uptime</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5/5</div>
              <p className="text-xs text-muted-foreground">All devices online</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connected Clients</CardTitle>
              <Radio className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">247</div>
              <p className="text-xs text-muted-foreground">Guest devices</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Device Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {networkDevices.map((device, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-md">
                  <div className="space-y-1">
                    <div className="font-medium">{device.name}</div>
                    <div className="text-sm text-muted-foreground">{device.location}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">{device.uptime}</div>
                      <div className="text-xs text-muted-foreground">Uptime</div>
                    </div>
                    <Badge 
                      variant={device.status === "healthy" ? "default" : "destructive"}
                      data-testid={`badge-status-${index}`}
                    >
                      {device.status}
                    </Badge>
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
