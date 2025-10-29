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

export default function Reports() {
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

  // Mock report/compliance data for each property
  const reportsByProperty: Record<string, {
    complianceScore: number;
    recentReportsCount: number;
    overdueReports: number;
    lastReportDate: string;
    status: "current" | "warning" | "overdue";
  }> = {
    "1": {
      complianceScore: 98,
      recentReportsCount: 12,
      overdueReports: 0,
      lastReportDate: "09/10/2025",
      status: "current",
    },
    "2": {
      complianceScore: 85,
      recentReportsCount: 8,
      overdueReports: 2,
      lastReportDate: "06/10/2025",
      status: "warning",
    },
    "3": {
      complianceScore: 72,
      recentReportsCount: 5,
      overdueReports: 5,
      lastReportDate: "28/09/2025",
      status: "overdue",
    },
  };

  // Calculate compliance status for each property
  const propertiesWithReports = useMemo(() => {
    return managerProperties.map(property => {
      const reports = reportsByProperty[property.id] || {
        complianceScore: 90,
        recentReportsCount: 10,
        overdueReports: 0,
        lastReportDate: "01/10/2025",
        status: "current",
      };
      
      // Calculate status based on compliance metrics
      let complianceStatus: "healthy" | "degraded" | "critical" | "offline" = "healthy";
      
      // Critical if compliance is poor or many overdue reports
      if (
        reports.complianceScore < 75 ||
        reports.overdueReports >= 5
      ) {
        complianceStatus = "critical";
      } 
      // Degraded if compliance needs attention
      else if (
        reports.complianceScore < 90 ||
        reports.overdueReports >= 2
      ) {
        complianceStatus = "degraded";
      }

      // Use recent reports count as incident count for the card
      const incidentCount = reports.recentReportsCount;
      
      // Overdue reports as critical count
      const criticalCount = reports.overdueReports;

      return {
        ...property,
        status: complianceStatus,
        incidentCount,
        criticalCount,
        newCount: 0,
      };
    });
  }, [managerProperties]);

  return (
    <AppLayout
      title="Reports"
      homeRoute="/manager"
      navSections={navSections}
      sidebarHeader={activeOrg && <OrganizationLogo organizationId={activeOrg.id} />}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-1">Reports & Compliance</h2>
          <p className="text-muted-foreground">Monitor reporting status and compliance across all properties</p>
        </div>

        <PropertyList
          properties={propertiesWithReports}
          onPropertyClick={(property) => {
            if (property.id) {
              setLocation(`/manager/properties/${property.id}`);
            }
          }}
        />
      </div>
    </AppLayout>
  );
}
