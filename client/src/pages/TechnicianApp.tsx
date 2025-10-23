import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { SummaryMetrics, type MetricTile } from "@/components/SummaryMetrics";
import { LogIssueDialog } from "@/components/LogIssueDialog";
import { PROPERTIES } from "@/lib/properties";
import type { Incident } from "@shared/schema";
import { 
  CheckCircle2, 
  ClipboardList, 
  Calendar, 
  Wrench, 
  Play,
  AlertTriangle,
} from "lucide-react";

export default function TechnicianApp() {
  const [, navigate] = useLocation();

  const navSections = [
    {
      label: "Work",
      items: [
        { title: "My Work", href: "/technician", icon: ClipboardList },
      ],
    },
    {
      label: "Maintenance",
      items: [
        { title: "Preventive Schedule", href: "/technician/schedule", icon: Calendar },
        { title: "Equipment", href: "/technician/equipment", icon: Wrench },
      ],
    },
  ];

  // Fetch all incidents
  const { data: allIncidents = [] } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
  });

  // TODO: Once authentication is implemented, filter by logged-in technician's property assignments
  // For now, show all incidents across all properties so metrics are accurate
  const technicianIncidents = useMemo(() => {
    return allIncidents;
  }, [allIncidents]);

  // Calculate summary metrics
  // Note: Currently showing all incidents from technician's properties
  // TODO: Filter by assignedTo when authentication is implemented
  const metrics: MetricTile[] = useMemo(() => {
    // Active statuses only (exclude terminal states: resolved, cancelled, duplicate)
    const activeIncidents = technicianIncidents.filter(i => 
      i.status !== 'resolved' && 
      i.status !== 'cancelled' && 
      i.status !== 'duplicate'
    );
    
    // My Queue = ALL active work items (new, assigned, in_progress, on_hold)
    const myQueue = activeIncidents.length;
    
    const inProgress = activeIncidents.filter(i => i.status === 'in_progress').length;
    
    const completedToday = technicianIncidents.filter(i => {
      if (i.status !== 'resolved') return false;
      const today = new Date().toDateString();
      return new Date(i.updatedAt).toDateString() === today;
    }).length;
    
    const criticalCount = activeIncidents.filter(i => i.priority === 'critical').length;

    return [
      {
        id: "my-queue",
        label: "My Queue",
        value: myQueue,
        icon: ClipboardList,
        variant: myQueue > 5 ? "high" : "default",
        onClick: () => navigate('/technician/incidents'),
      },
      {
        id: "in-progress",
        label: "In Progress",
        value: inProgress,
        icon: Play,
        variant: "medium",
        onClick: () => navigate('/technician/incidents?status=in_progress'),
      },
      {
        id: "completed-today",
        label: "Completed Today",
        value: completedToday,
        icon: CheckCircle2,
        variant: "success",
        onClick: () => navigate('/technician/incidents?status=resolved'),
      },
      {
        id: "critical",
        label: "Critical",
        value: criticalCount,
        icon: AlertTriangle,
        variant: criticalCount > 0 ? "critical" : "default",
        onClick: () => navigate('/technician/incidents?priority=critical'),
      },
    ];
  }, [technicianIncidents, navigate]);


  return (
    <AppLayout
      title="Technician App"
      homeRoute="/technician"
      notificationCount={technicianIncidents.filter(i => i.status === 'assigned' || i.status === 'in_progress').length}
      navSections={navSections}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        {/* Summary Metrics */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">My Work</h2>
              <p className="text-muted-foreground">Manage your assigned incidents</p>
            </div>
            <LogIssueDialog />
          </div>
          
          <SummaryMetrics metrics={metrics} />
        </div>
      </div>
    </AppLayout>
  );
}
