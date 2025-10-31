import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { OrganizationLogo } from "@/components/OrganizationLogo";
import { useActiveOrganization } from "@/hooks/use-active-organization";
import { ReportDataTable, ColumnDef, FilterDef } from "@/components/ReportDataTable";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  AlertTriangle,
  BarChart3,
  FileText,
  MessageSquare,
  Wifi,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface SLAData {
  id: string;
  title: string;
  priority: string;
  status: string;
  propertyId: string;
  createdAt: string;
  resolutionHours: number;
  slaTarget: number;
  slaStatus: string;
  slaBreachBy: number;
}

export default function SLAPerformanceReport() {
  const { data: activeOrg } = useActiveOrganization();
  const [, setLocation] = useLocation();

  const { data: slaData = [], isLoading } = useQuery<SLAData[]>({
    queryKey: ["/api/reports/sla-performance"],
  });

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

  const columns: ColumnDef<SLAData>[] = [
    {
      id: "id",
      label: "ID",
      accessor: (row) => row.id.split("-").pop()?.substring(0, 8) || "",
      sortable: true,
    },
    {
      id: "title",
      label: "Title",
      accessor: (row) => row.title,
      sortable: true,
    },
    {
      id: "priority",
      label: "Priority",
      accessor: (row) => row.priority,
      sortable: true,
      filterable: true,
      render: (value) => {
        const colors: Record<string, string> = {
          critical: "destructive",
          high: "default",
          medium: "secondary",
          low: "outline",
        };
        return (
          <Badge variant={colors[value] as any}>
            {value}
          </Badge>
        );
      },
    },
    {
      id: "slaTarget",
      label: "SLA Target",
      accessor: (row) => row.slaTarget,
      sortable: true,
      render: (value) => `${value}h`,
    },
    {
      id: "resolutionHours",
      label: "Actual Time",
      accessor: (row) => row.resolutionHours,
      sortable: true,
      render: (value) => `${value}h`,
    },
    {
      id: "slaStatus",
      label: "SLA Status",
      accessor: (row) => row.slaStatus,
      sortable: true,
      filterable: true,
      render: (value) => {
        const colors: Record<string, string> = {
          met: "outline",
          breached: "destructive",
          at_risk: "default",
          on_track: "secondary",
        };
        const labels: Record<string, string> = {
          met: "Met",
          breached: "Breached",
          at_risk: "At Risk",
          on_track: "On Track",
        };
        return (
          <Badge variant={colors[value] as any} data-testid={`badge-sla-${value}`}>
            {labels[value] || value}
          </Badge>
        );
      },
    },
    {
      id: "slaBreachBy",
      label: "Breach By",
      accessor: (row) => row.slaBreachBy,
      sortable: true,
      render: (value) => (value > 0 ? <span className="text-destructive font-semibold">+{value}h</span> : "-"),
    },
    {
      id: "createdAt",
      label: "Created",
      accessor: (row) => row.createdAt,
      sortable: true,
      render: (value) => format(new Date(value), "dd/MM/yyyy HH:mm"),
    },
  ];

  const filters: FilterDef[] = [
    {
      id: "priority",
      label: "Priority",
      options: [
        { value: "critical", label: "Critical" },
        { value: "high", label: "High" },
        { value: "medium", label: "Medium" },
        { value: "low", label: "Low" },
      ],
    },
    {
      id: "slaStatus",
      label: "SLA Status",
      options: [
        { value: "met", label: "Met" },
        { value: "breached", label: "Breached" },
        { value: "at_risk", label: "At Risk" },
        { value: "on_track", label: "On Track" },
      ],
    },
  ];

  return (
    <AppLayout
      title="SLA Performance Report"
      homeRoute="/manager"
      navSections={navSections}
      sidebarHeader={activeOrg && <OrganizationLogo organizationId={activeOrg.id} />}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/manager/analytics")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">SLA Performance Report</h2>
            <p className="text-muted-foreground">
              Track SLA compliance and resolution times across properties
            </p>
          </div>
        </div>

        <ReportDataTable
          data={slaData}
          columns={columns}
          filters={filters}
          searchPlaceholder="Search SLA data..."
          exportFileName="sla-performance-report"
          isLoading={isLoading}
        />
      </div>
    </AppLayout>
  );
}
