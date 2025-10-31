import { AppLayout } from "@/components/AppLayout";
import { OrganizationLogo } from "@/components/OrganizationLogo";
import { useActiveOrganization } from "@/hooks/use-active-organization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LayoutDashboard,
  AlertTriangle,
  BarChart3,
  FileText,
  MessageSquare,
  Wifi,
} from "lucide-react";

export default function Messages() {
  const { data: activeOrg } = useActiveOrganization();

  const navSections = [
    {
      label: "Main",
      items: [
        { title: "Dashboard", href: "/hotel-manager", icon: LayoutDashboard },
        { title: "Incidents", href: "/hotel-manager/incidents", icon: AlertTriangle },
        { title: "Network Status", href: "/hotel-manager/network", icon: Wifi },
      ],
    },
    {
      label: "Analysis",
      items: [
        { title: "Analytics", href: "/hotel-manager/analytics", icon: BarChart3 },
        { title: "Analytics & Reports", href: "/hotel-manager/analytics", icon: FileText },
      ],
    },
  ];

  return (
    <AppLayout
      title="Guest Messages"
      navSections={navSections}
      homeRoute="/hotel-manager"
      sidebarHeader={activeOrg && <OrganizationLogo organizationId={activeOrg.id} />}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h2 className="text-2xl font-bold mb-6">Guest Messages</h2>
        <Card>
          <CardHeader>
