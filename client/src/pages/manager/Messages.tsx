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
} from "lucide-react";

export default function Messages() {
  const properties = [
    { id: "1", name: "Grand Hotel Downtown", location: "New York, NY" },
    { id: "2", name: "Beachside Resort", location: "Miami, FL" },
    { id: "3", name: "Mountain Lodge", location: "Denver, CO" },
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

  const messages = [
    { guest: "Sarah Johnson", room: "302", message: "Wi-Fi not working in room", time: "5m ago", status: "unread" },
    { guest: "Michael Brown", room: "215", message: "Slow connection, please help", time: "15m ago", status: "unread" },
    { guest: "Emma Davis", room: "420", message: "Thank you for quick resolution!", time: "1h ago", status: "read" },
  ];

  return (
    <AppLayout
      title="Guest Messages"
      homeRoute="/manager"
      notificationCount={2}
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
          <h2 className="text-2xl font-bold mb-1">Guest Communication</h2>
          <p className="text-muted-foreground">Messages and feedback from guests</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className="flex items-start justify-between p-4 border rounded-md">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{msg.guest}</span>
                      <span className="text-sm text-muted-foreground">Room {msg.room}</span>
                    </div>
                    <div className="text-sm">{msg.message}</div>
                    <div className="text-xs text-muted-foreground">{msg.time}</div>
                  </div>
                  <Badge 
                    variant={msg.status === "unread" ? "default" : "outline"}
                    data-testid={`badge-status-${index}`}
                  >
                    {msg.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
