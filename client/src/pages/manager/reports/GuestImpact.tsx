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

interface GuestImpactData {
  id: string;
  title: string;
  priority: string;
  status: string;
  propertyId: string;
  affectedGuests: number;
  resolutionHours: number;
  impactScore: number;
  createdAt: string;
  category: string;
}

export default function GuestImpactReport() {
  const { data: activeOrg } = useActiveOrganization();
  const [, setLocation] = useLocation();

  const { data: guestImpactData = [], isLoading } = useQuery<GuestImpactData[]>({
    queryKey: ["/api/reports/guest-impact"],
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

  const columns: ColumnDef<GuestImpactData>[] = [
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
      id: "category",
      label: "Category",
      accessor: (row) => row.category || "Uncategorized",
      sortable: true,
    },
    {
      id: "affectedGuests",
      label: "Affected Guests",
      accessor: (row) => row.affectedGuests,
      sortable: true,
      render: (value) => <span className="font-semibold">{value}</span>,
    },
    {
      id: "resolutionHours",
      label: "Resolution Time",
      accessor: (row) => row.resolutionHours,
      sortable: true,
      render: (value) => `${value}h`,
    },
    {
      id: "impactScore",
      label: "Impact Score",
      accessor: (row) => row.impactScore,
      sortable: true,
      render: (value) => {
        const color = value > 1000 ? "text-destructive" : value > 500 ? "text-yellow-600" : "";
        return <span className={`font-semibold ${color}`}>{value.toLocaleString()}</span>;
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
          <Badge variant={colors[value] as any}>
            {value.replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      id: "createdAt",
      label: "Created",
      accessor: (row) => row.createdAt,
      sortable: true,
      render: (value) => format(new Date(value), "dd/MM/yyyy"),
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
      ],
    },
  ];

  return (
    <AppLayout
      title="Guest Impact Report"
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
            <h2 className="text-2xl font-bold">Guest Impact Report</h2>
            <p className="text-muted-foreground">
              Analysis of incidents affecting guests and service quality
            </p>
          </div>
        </div>

        <ReportDataTable
          data={guestImpactData}
          columns={columns}
          filters={filters}
          searchPlaceholder="Search guest impact incidents..."
          exportFileName="guest-impact-report"
          isLoading={isLoading}
        />
      </div>
    </AppLayout>
  );
}
