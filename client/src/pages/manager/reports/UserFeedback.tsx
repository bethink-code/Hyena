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
import type { HelpComment } from "@shared/schema";

export default function UserFeedbackReport() {
  const { data: activeOrg } = useActiveOrganization();
  const [, setLocation] = useLocation();

  const { data: feedbackData = [], isLoading } = useQuery<HelpComment[]>({
    queryKey: ["/api/reports/user-feedback"],
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
    {
      label: "Communication",
      items: [
        { title: "Guest Messages", href: "/manager/messages", icon: MessageSquare },
      ],
    },
  ];

  const columns: ColumnDef<HelpComment>[] = [
    {
      id: "authorName",
      label: "Author",
      accessor: (row) => row.authorName,
      sortable: true,
    },
    {
      id: "authorRole",
      label: "Role",
      accessor: (row) => row.authorRole,
      sortable: true,
      filterable: true,
      render: (value) => (
        <Badge variant="outline" data-testid={`badge-role-${value}`}>
          {value}
        </Badge>
      ),
    },
    {
      id: "route",
      label: "Page",
      accessor: (row) => row.route,
      sortable: true,
      filterable: true,
      render: (value) => {
        const pageNames: Record<string, string> = {
          '/manager': 'Manager Dashboard',
          '/manager/incidents': 'Manager Incidents',
          '/manager/network': 'Manager Network',
          '/manager/analytics': 'Manager Analytics',
          '/manager/reports': 'Manager Reports',
          '/hotel-manager': 'Regional Manager Dashboard',
          '/hotel-manager/incidents': 'Regional Manager Incidents',
          '/hotel-manager/network': 'Regional Manager Network',
          '/hotel-manager/analytics': 'Regional Manager Analytics',
          '/hotel-manager/reports': 'Regional Manager Reports',
          '/admin': 'Admin Dashboard',
          '/admin/incidents': 'Admin Incidents',
          '/admin/properties': 'Admin Properties',
          '/admin/users': 'Admin Users',
          '/admin/config': 'Admin Config',
          '/admin/integrations': 'Admin Integrations',
          '/admin/analytics': 'Admin Analytics',
          '/admin/reports': 'Admin Reports',
          '/admin/audit': 'Admin Audit',
          '/admin/organizations': 'Admin Organizations',
          '/technician': 'Technician Dashboard',
          '/technician/incidents': 'Technician Incidents',
        };
        return <span className="text-sm">{pageNames[value] || value}</span>;
      },
    },
    {
      id: "body",
      label: "Comment",
      accessor: (row) => row.body,
      sortable: false,
      render: (value) => (
        <div className="max-w-md">
          <p className="text-sm line-clamp-2">{value}</p>
        </div>
      ),
    },
    {
      id: "createdAt",
      label: "Date",
      accessor: (row) => row.createdAt,
      sortable: true,
      render: (value) => format(new Date(value), "dd/MM/yyyy HH:mm"),
    },
  ];

  const roleOptions = [
    { value: "Manager", label: "Manager" },
    { value: "Regional Manager", label: "Regional Manager" },
    { value: "Admin", label: "Admin" },
    { value: "Technician", label: "Technician" },
    { value: "Guest", label: "Guest" },
  ];

  const routeOptions = [
    { value: "/manager", label: "Manager Dashboard" },
    { value: "/hotel-manager", label: "Regional Manager Dashboard" },
    { value: "/admin", label: "Admin Dashboard" },
    { value: "/technician", label: "Technician Dashboard" },
  ];

  const filters: FilterDef[] = [
    {
      id: "authorRole",
      label: "Role",
      options: roleOptions,
    },
    {
      id: "route",
      label: "Page",
      options: routeOptions,
    },
  ];

  return (
    <AppLayout
      title="User Feedback Report"
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
            <h2 className="text-2xl font-bold">User Feedback Report</h2>
            <p className="text-muted-foreground">
              Centralized view of all user comments and feedback across the platform
            </p>
          </div>
        </div>

        <ReportDataTable
          data={feedbackData}
          columns={columns}
          filters={filters}
          searchPlaceholder="Search feedback..."
          exportFileName="user-feedback-report"
          isLoading={isLoading}
        />
      </div>
    </AppLayout>
  );
}
