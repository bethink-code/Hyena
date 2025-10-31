import { useMemo } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { OrganizationLogo } from "@/components/OrganizationLogo";
import { useActiveOrganization } from "@/hooks/use-active-organization";
import { PropertyList } from "@/components/PropertyList";
import { PROPERTIES } from "@/lib/properties";
import {
  AlertTriangle,
  BarChart3,
  FileText,
  MessageSquare,
  Wifi,
} from "lucide-react";

export default function Messages() {
  const { data: activeOrg } = useActiveOrganization();
  const [, setLocation] = useLocation();
  
  // Use the first 3 properties for the manager's scope
  const managerProperties = PROPERTIES.slice(0, 3);

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
        { title: "Analytics & Reports", href: "/manager/analytics", icon: FileText },
      ],
    },
  ];

  // Mock message data for each property
  const messagesByProperty: Record<string, { 
    unreadCount: number; 
    totalMessages: number; 
    urgentCount: number;
    avgResponseTime: number; // in minutes
  }> = {
    "1": {
      unreadCount: 2,
      totalMessages: 45,
      urgentCount: 0,
      avgResponseTime: 15,
    },
    "2": {
      unreadCount: 5,
      totalMessages: 68,
      urgentCount: 2,
      avgResponseTime: 35,
    },
    "3": {
      unreadCount: 8,
      totalMessages: 92,
      urgentCount: 4,
      avgResponseTime: 65,
    },
  };

  // Calculate communication status for each property
  const propertiesWithMessages = useMemo(() => {
    return managerProperties.map(property => {
      const messages = messagesByProperty[property.id] || {
        unreadCount: 0,
        totalMessages: 0,
        urgentCount: 0,
        avgResponseTime: 0,
      };
      
      // Determine status based on communication metrics
      let status: "healthy" | "degraded" | "critical" | "offline" = "healthy";
      
      // Critical: 3+ urgent messages OR avg response time > 60 min
      if (messages.urgentCount >= 3 || messages.avgResponseTime > 60) {
        status = "critical";
      }
      // Degraded: 1-2 urgent messages OR avg response time > 30 min OR 5+ unread
      else if (
        messages.urgentCount >= 1 || 
        messages.avgResponseTime > 30 || 
        messages.unreadCount >= 5
      ) {
        status = "degraded";
      }

      return {
        ...property,
        status,
        incidentCount: messages.unreadCount,
        criticalCount: messages.urgentCount,
        newCount: 0,
      };
    });
  }, [managerProperties]);

  return (
    <AppLayout
      title="Guest Messages"
      homeRoute="/manager"
      navSections={navSections}
      sidebarHeader={activeOrg && <OrganizationLogo organizationId={activeOrg.id} />}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <div>
