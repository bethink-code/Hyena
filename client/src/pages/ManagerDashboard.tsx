import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { OrganizationLogo } from "@/components/OrganizationLogo";
import { PropertyList } from "@/components/PropertyList";
import { SummaryMetrics, type MetricTile } from "@/components/SummaryMetrics";
import { IncidentQueue } from "@/components/IncidentQueue";
import { IncidentDetailPanel, type IncidentDetailProps } from "@/components/IncidentDetailPanel";
import { ReportIncidentDialog } from "@/components/ReportIncidentDialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PROPERTIES } from "@/lib/properties";
import type { Incident, IncidentTimeline } from "@shared/schema";
import {
  LayoutDashboard,
  AlertTriangle,
  BarChart3,
  FileText,
  MessageSquare,
  Wifi,
  Clock,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

export default function ManagerDashboard() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("all");
  
  // Use the first 3 properties for the manager's scope
  const managerProperties = PROPERTIES.slice(0, 3);
  const managerPropertyIds = managerProperties.map(p => p.id);

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

  // Fetch all incidents
  const { data: allIncidents = [] } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
  });

  // Filter incidents for manager's properties and selected property
  const incidents = useMemo(() => {
    const managerIncidents = allIncidents.filter(i => managerPropertyIds.includes(i.propertyId || ''));
    
    if (selectedPropertyId === "all") {
      return managerIncidents;
    }
    
    return managerIncidents.filter(i => i.propertyId === selectedPropertyId);
  }, [allIncidents, selectedPropertyId, managerPropertyIds]);

  // Fetch timeline for selected incident
  const { data: timeline = [] } = useQuery<IncidentTimeline[]>({
    queryKey: ["/api/incidents", selectedIncidentId, "timeline"],
    enabled: !!selectedIncidentId,
  });

  // Calculate summary metrics
  const metrics: MetricTile[] = useMemo(() => {
    const managerIncidents = allIncidents.filter(i => managerPropertyIds.includes(i.propertyId || ''));
    
    // Active incidents = exclude terminal statuses (resolved, cancelled, duplicate)
    const activeIncidents = managerIncidents.filter(i => 
      i.status !== 'resolved' && 
      i.status !== 'cancelled' && 
      i.status !== 'duplicate'
    );
    
    const criticalCount = activeIncidents.filter(i => i.priority === 'critical').length;
    const activeCount = activeIncidents.length;
    const inProgressCount = activeIncidents.filter(i => i.status === 'in_progress').length;
    const resolvedToday = managerIncidents.filter(i => {
      if (i.status !== 'resolved') return false;
      const today = new Date().toDateString();
      return new Date(i.updatedAt).toDateString() === today;
    }).length;

    return [
      {
        id: "critical",
        label: "Critical Incidents",
        value: criticalCount,
        icon: AlertTriangle,
        variant: criticalCount > 0 ? "critical" : "default",
        onClick: () => setLocation('/manager/incidents?priority=critical'),
      },
      {
        id: "active",
        label: "Active Incidents",
        value: activeCount,
        icon: LayoutDashboard,
        variant: activeCount > 5 ? "high" : "default",
        onClick: () => setLocation('/manager/incidents'),
      },
      {
        id: "in-progress",
        label: "In Progress",
        value: inProgressCount,
        icon: Clock,
        variant: "medium",
        onClick: () => setLocation('/manager/incidents?status=in_progress'),
      },
      {
        id: "resolved-today",
        label: "Resolved Today",
        value: resolvedToday,
        icon: CheckCircle2,
        variant: "success",
        onClick: () => setLocation('/manager/incidents?status=resolved'),
      },
    ];
  }, [allIncidents, managerPropertyIds, setLocation]);

  // Calculate property stats with critical and new counts
  const propertiesWithStats = useMemo(() => {
    return managerProperties.map(property => {
      const propertyIncidents = allIncidents.filter(i => i.propertyId === property.id);
      // Active incidents = exclude terminal statuses (resolved, cancelled, duplicate)
      const activeIncidents = propertyIncidents.filter(i => 
        i.status !== 'resolved' && 
        i.status !== 'cancelled' && 
        i.status !== 'duplicate'
      );
      const incidentCount = activeIncidents.length;
      const criticalCount = activeIncidents.filter(i => i.priority === 'critical').length;
      const newCount = activeIncidents.filter(i => i.status === 'new').length;

      // Determine status based on incidents
      let status: "healthy" | "degraded" | "critical" | "offline" = "healthy";
      if (criticalCount > 0) status = "critical";
      else if (incidentCount > 3) status = "degraded";
      else if (incidentCount > 0) status = "degraded";

      return {
        ...property,
        status,
        incidentCount,
        criticalCount,
        newCount,
      };
    });
  }, [managerProperties, allIncidents]);

  // Assign incident mutation
  const assignIncidentMutation = useMutation({
    mutationFn: async ({ incidentId, assignedTo }: { incidentId: string; assignedTo: string }) => {
      const response = await apiRequest("PATCH", `/api/incidents/${incidentId}`, {
        status: "assigned",
        assignedTo,
      });
      const incident = await response.json();
      
      await apiRequest("POST", `/api/incidents/${incidentId}/timeline`, {
        action: `Assigned to ${assignedTo}`,
        actor: "Manager Dashboard",
      });
      
      return incident;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/incidents", selectedIncidentId, "timeline"] });
      toast({
        title: "Incident Assigned",
        description: "Technician has been notified",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Assignment Failed",
        description: error.message || "Failed to assign incident",
        variant: "destructive",
      });
    },
  });

  // Resolve incident mutation
  const resolveIncidentMutation = useMutation({
    mutationFn: async (incidentId: string) => {
      const response = await apiRequest("PATCH", `/api/incidents/${incidentId}`, {
        status: "resolved",
      });
      const incident = await response.json();
      
      await apiRequest("POST", `/api/incidents/${incidentId}/timeline`, {
        action: "Incident marked as resolved",
        actor: "Manager Dashboard",
      });
      
      return incident;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/incidents", selectedIncidentId, "timeline"] });
      toast({
        title: "Incident Resolved",
        description: "Incident has been marked as resolved",
      });
      setSelectedIncidentId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Resolution Failed",
        description: error.message || "Failed to resolve incident",
        variant: "destructive",
      });
    },
  });

  // Escalate incident mutation
  const escalateIncidentMutation = useMutation({
    mutationFn: async (incidentId: string) => {
      const currentIncident = incidents.find(i => i.id === incidentId);
      const newPriority = currentIncident?.priority === 'critical' ? 'critical' : 
        currentIncident?.priority === 'high' ? 'critical' :
        currentIncident?.priority === 'medium' ? 'high' : 'medium';
      
      const response = await apiRequest("PATCH", `/api/incidents/${incidentId}`, {
        priority: newPriority,
      });
      const incident = await response.json();
      
      await apiRequest("POST", `/api/incidents/${incidentId}/timeline`, {
        action: `Priority escalated to ${newPriority}`,
        actor: "Manager Dashboard",
      });
      
      return incident;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/incidents", selectedIncidentId, "timeline"] });
      toast({
        title: "Priority Escalated",
        description: "Incident priority has been increased",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Escalation Failed",
        description: error.message || "Failed to escalate incident",
        variant: "destructive",
      });
    },
  });

  const selectedIncident = selectedIncidentId 
    ? incidents.find(i => i.id === selectedIncidentId)
    : null;

  const incidentDetailProps: IncidentDetailProps | null = selectedIncident
    ? {
        id: selectedIncident.id,
        title: selectedIncident.title,
        description: selectedIncident.description,
        priority: selectedIncident.priority as any,
        status: selectedIncident.status as any,
        location: selectedIncident.location || undefined,
        assignedTo: selectedIncident.assignedTo || undefined,
        timestamp: new Date(selectedIncident.createdAt).toLocaleString(),
        category: selectedIncident.category || undefined,
        affectedGuests: selectedIncident.affectedGuests || undefined,
        estimatedResolution: selectedIncident.estimatedResolution || undefined,
        rootCause: selectedIncident.rootCause || undefined,
        resolution: selectedIncident.resolution || undefined,
        timeline: timeline.map((t) => ({
          timestamp: new Date(t.timestamp).toLocaleTimeString(),
          action: t.action,
          actor: t.actor,
        })),
      }
    : null;

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <AppLayout
      title="Incident Management"
      navSections={navSections}
      homeRoute="/manager"
      notificationCount={incidents.filter(i => i.status === 'new').length}
      sidebarHeader={<OrganizationLogo organizationId="org-sun-international" />}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Property Overview</h2>
            <p className="text-muted-foreground">Multi-property health and incident metrics</p>
          </div>
          <ReportIncidentDialog />
        </div>

        <SummaryMetrics metrics={metrics} />

        <div>
          <h3 className="text-xl font-semibold mb-4">Property Status</h3>
          <PropertyList
            properties={propertiesWithStats}
            onPropertyClick={(property) => {
              if (property.id) {
                setLocation(`/manager/incidents?propertyId=${property.id}`);
              }
            }}
          />
        </div>
      </div>

      <IncidentDetailPanel
        incident={incidentDetailProps}
        open={!!selectedIncidentId}
        onClose={() => setSelectedIncidentId(null)}
        onResolve={(id) => {
          resolveIncidentMutation.mutate(id);
        }}
        onEscalate={(id) => {
          escalateIncidentMutation.mutate(id);
        }}
      />
    </AppLayout>
  );
}
