import { AppLayout } from "../AppLayout";
import { LayoutDashboard, AlertTriangle, BarChart3, FileText } from "lucide-react";

export default function AppLayoutExample() {
  const navSections = [
    {
      label: "Main",
      items: [
        { title: "Dashboard", href: "/manager", icon: LayoutDashboard },
        { title: "Incidents", href: "/manager/incidents", icon: AlertTriangle },
      ],
    },
    {
      label: "Analysis",
      items: [
        { title: "Analytics", href: "/manager/analytics", icon: BarChart3 },
        { title: "Reports", href: "/manager/reports", icon: FileText },
      ],
    },
  ];

  return (
    <AppLayout
      title="Manager Dashboard"
      homeRoute="/manager"
      notificationCount={4}
      navSections={navSections}
      showSidebar={true}
    >
      <div className="p-8">
        <h2 className="text-2xl font-bold">Dashboard Content</h2>
        <p className="text-muted-foreground mt-2">
          This is where the main content goes
        </p>
      </div>
    </AppLayout>
  );
}
