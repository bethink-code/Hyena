import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { OrganizationLogo } from "@/components/OrganizationLogo";
import { useActiveOrganization } from "@/hooks/use-active-organization";
import { ReportDataTable, ColumnDef } from "@/components/ReportDataTable";
import { Badge } from "@/components/ui/badge";
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

interface CategoryData {
  category: string;
  totalIncidents: number;
  resolvedIncidents: number;
  criticalIncidents: number;
  avgResolutionTime: number;
  resolutionRate: number;
}

export default function CategoryAnalysisReport() {
  const { data: activeOrg } = useActiveOrganization();
  const [, setLocation] = useLocation();

  const { data: categoryData = [], isLoading } = useQuery<CategoryData[]>({
    queryKey: ["/api/reports/category-analysis"],
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

  const columns: ColumnDef<CategoryData>[] = [
    {
      id: "category",
      label: "Category",
      accessor: (row) => row.category,
      sortable: true,
      render: (value) => (
        <Badge variant="outline" className="font-semibold">
          {value}
        </Badge>
      ),
    },
    {
      id: "totalIncidents",
      label: "Total Incidents",
      accessor: (row) => row.totalIncidents,
      sortable: true,
      render: (value) => <span className="font-semibold">{value}</span>,
    },
    {
      id: "resolvedIncidents",
      label: "Resolved",
      accessor: (row) => row.resolvedIncidents,
      sortable: true,
    },
    {
      id: "criticalIncidents",
      label: "Critical",
      accessor: (row) => row.criticalIncidents,
      sortable: true,
      render: (value) =>
        value > 0 ? <span className="text-destructive font-semibold">{value}</span> : value,
    },
    {
      id: "resolutionRate",
      label: "Resolution Rate",
      accessor: (row) => row.resolutionRate,
      sortable: true,
      render: (value) => {
        const color = value >= 80 ? "text-green-600" : value >= 50 ? "text-yellow-600" : "text-destructive";
        return <span className={`font-semibold ${color}`}>{value}%</span>;
      },
    },
    {
      id: "avgResolutionTime",
      label: "Avg Resolution Time",
      accessor: (row) => row.avgResolutionTime,
      sortable: true,
      render: (value) => `${value}h`,
    },
  ];

  return (
    <AppLayout
      title="Category Analysis Report"
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
            <h2 className="text-2xl font-bold">Category Analysis Report</h2>
            <p className="text-muted-foreground">
              Breakdown of incidents by category and trends over time
            </p>
          </div>
        </div>

        <ReportDataTable
          data={categoryData}
          columns={columns}
          searchPlaceholder="Search categories..."
          exportFileName="category-analysis-report"
          isLoading={isLoading}
        />
      </div>
    </AppLayout>
  );
}
