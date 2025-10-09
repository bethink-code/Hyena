import { AppLayout } from "@/components/AppLayout";
import { PropertySelector } from "@/components/PropertySelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  AlertTriangle,
  BarChart3,
  FileText,
  MessageSquare,
  Wifi,
  Download,
} from "lucide-react";

export default function Reports() {
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

  const reports = [
    { name: "Daily Incident Summary", date: "09/10/2025", format: "PDF" },
    { name: "Weekly Performance Report", date: "06/10/2025", format: "PDF" },
    { name: "Monthly Network Analysis", date: "01/10/2025", format: "PDF" },
    { name: "Guest Satisfaction Report", date: "01/10/2025", format: "PDF" },
  ];

  return (
    <AppLayout
      title="Reports"
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
          <h2 className="text-2xl font-bold mb-1">Reports & Documentation</h2>
          <p className="text-muted-foreground">Generate and download operational reports</p>
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
                    <div className="text-sm text-muted-foreground">Generated: {report.date}</div>
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
