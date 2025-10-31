import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { OrganizationLogo } from "@/components/OrganizationLogo";
import { useActiveOrganization } from "@/hooks/use-active-organization";
import { ReportDataTable, ColumnDef, FilterDef } from "@/components/ReportDataTable";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { MANAGER_NAV } from "@/config/navigation";
import {
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface IncidentData {
  id: string;
  title: string;
  priority: string;
  status: string;
  propertyId: string;
  category: string;
  affectedGuests: number | null;
  resolutionHours: number;
  isOverdue: boolean;
  createdAt: string;
}

export default function IncidentSummaryReport() {
  const { data: activeOrg } = useActiveOrganization();
  const [, setLocation] = useLocation();

  const { data: incidents = [], isLoading } = useQuery<IncidentData[]>({
    queryKey: ["/api/reports/incidents"],
  });

  const columns: ColumnDef<IncidentData>[] = [
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
          <Badge variant={colors[value] as any} data-testid={`badge-priority-${value}`}>
            {value}
          </Badge>
        );
      },
    },
    {
      id: "status",
      label: "Status",
      accessor: (row) => row.status,
      sortable: true,
      filterable: true,
      render: (value) => {
        const colors: Record<string, string> = {
          new: "default",
          assigned: "secondary",
          in_progress: "default",
          resolved: "outline",
          cancelled: "outline",
          on_hold: "secondary",
        };
        return (
          <Badge variant={colors[value] as any} data-testid={`badge-status-${value}`}>
            {value.replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      id: "category",
      label: "Category",
      accessor: (row) => row.category || "Uncategorized",
      sortable: true,
      filterable: true,
    },
    {
      id: "affectedGuests",
      label: "Guests",
      accessor: (row) => row.affectedGuests || 0,
      sortable: true,
    },
    {
      id: "resolutionHours",
      label: "Hours",
      accessor: (row) => row.resolutionHours,
      sortable: true,
      render: (value, row) => (
        <span className={row.isOverdue ? "text-destructive font-semibold" : ""}>
          {value}h
        </span>
      ),
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
      id: "status",
      label: "Status",
      options: [
        { value: "new", label: "New" },
        { value: "assigned", label: "Assigned" },
        { value: "in_progress", label: "In Progress" },
        { value: "resolved", label: "Resolved" },
        { value: "cancelled", label: "Cancelled" },
        { value: "on_hold", label: "On Hold" },
      ],
    },
  ];

  return (
    <AppLayout
      title="Incident Summary Report"
      homeRoute="/manager"
      navSections={MANAGER_NAV}
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
            <h2 className="text-2xl font-bold">Incident Summary Report</h2>
            <p className="text-muted-foreground">
              Complete overview of all incidents with filtering and export capabilities
            </p>
          </div>
        </div>

        <ReportDataTable
          data={incidents}
          columns={columns}
          filters={filters}
          searchPlaceholder="Search incidents..."
          exportFileName="incident-summary-report"
          isLoading={isLoading}
        />
      </div>
    </AppLayout>
  );
}
