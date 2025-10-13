import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
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
    const criticalCount = incidents.filter(i => i.priority === 'critical' && i.status !== 'resolved').length;
    const activeCount = incidents.filter(i => i.status !== 'resolved').length;
    const assignedCount = incidents.filter(i => i.status === 'assigned' || i.status === 'in_progress').length;
    const resolvedToday = incidents.filter(i => {
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
      },
      {
        id: "active",
        label: "Active Incidents",
        value: activeCount,
        icon: LayoutDashboard,
        variant: activeCount > 5 ? "high" : "default",
      },
      {
        id: "in-progress",
        label: "In Progress",
        value: assignedCount,
        icon: Clock,
        variant: "medium",
      },
      {
        id: "resolved-today",
        label: "Resolved Today",
        value: resolvedToday,
        icon: CheckCircle2,
        variant: "success",
      },
    ];
  }, [incidents]);

  // Calculate property stats with critical and new counts
  const propertiesWithStats = useMemo(() => {
    return managerProperties.map(property => {
      const propertyIncidents = allIncidents.filter(i => i.propertyId === property.id);
      const activeIncidents = propertyIncidents.filter(i => i.status !== 'resolved');
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
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-page-title">Incidents</h1>
            <p className="text-muted-foreground mt-1">Monitor and manage network incidents across your properties</p>
          </div>
          <ReportIncidentDialog />
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-1">My Properties</h2>
            <p className="text-sm text-muted-foreground">Properties under your management</p>
          </div>
          <PropertyList
            properties={propertiesWithStats}
            onPropertyClick={(property) => {
              if (property.id) {
                setLocation(`/manager/properties/${property.id}`);
              }
            }}
          />
        </div>

        <SummaryMetrics metrics={metrics} />

        <IncidentQueue
          incidents={incidents.map((incident) => ({
            id: incident.id,
            title: incident.title,
            description: incident.description,
            priority: incident.priority as any,
            status: incident.status as any,
            location: incident.location || undefined,
            assignedTo: incident.assignedTo || undefined,
            timestamp: formatTimestamp(incident.createdAt),
          }))}
          onIncidentClick={(id) => setSelectedIncidentId(id)}
          properties={managerProperties}
          selectedPropertyId={selectedPropertyId}
          onPropertyChange={setSelectedPropertyId}
          showPropertyFilter={true}
        />
      </div>

      <IncidentDetailPanel
        incident={incidentDetailProps}
        open={!!selectedIncidentId}
        onClose={() => setSelectedIncidentId(null)}
        onAssign={(id) => {
          assignIncidentMutation.mutate({
            incidentId: id,
            assignedTo: "John Smith",
          });
        }}
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
