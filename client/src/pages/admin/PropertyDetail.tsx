import { useState, useMemo } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { SummaryMetrics, type MetricTile } from "@/components/SummaryMetrics";
import { IncidentQueue } from "@/components/IncidentQueue";
import { IncidentDetailPanel, type IncidentDetailProps } from "@/components/IncidentDetailPanel";
import { ReportIncidentDialog } from "@/components/ReportIncidentDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getPropertyById } from "@/lib/properties";
import type { Incident, IncidentTimeline } from "@shared/schema";
import {
  LayoutDashboard,
  ArrowLeft,
  MapPin,
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

export default function PropertyDetail() {
  const { toast } = useToast();
  const params = useParams<{ id: string }>();
  const propertyId = params.id;
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  // Find property details from shared constants
  const property = getPropertyById(propertyId || "");

  const navSections = [
    {
      label: "Navigation",
      items: [
        { title: "Portfolio Dashboard", href: "/admin", icon: LayoutDashboard },
      ],
    },
  ];

  // Fetch all incidents
  const { data: allIncidents = [] } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
  });

  // Filter incidents by selected property
  const incidents = allIncidents.filter(i => i.propertyId === propertyId);

  // Calculate property status based on incidents
  const getPropertyStatus = (): "healthy" | "degraded" | "critical" | "offline" => {
    const activeIncidents = incidents.filter(i => i.status !== 'resolved');
    const hasCritical = activeIncidents.some(i => i.priority === 'critical');
    const activeCount = activeIncidents.length;

    if (hasCritical) return "critical";
    if (activeCount > 3) return "degraded";
    if (activeCount > 0) return "degraded";
    return "healthy";
  };

  const propertyStatus = getPropertyStatus();
  const statusVariant = propertyStatus === "healthy" ? "default" : 
                        propertyStatus === "degraded" ? "secondary" : 
                        "destructive";
  const statusLabel = propertyStatus.toUpperCase();
  const activeIncidentCount = incidents.filter(i => i.status !== 'resolved').length;

  // Fetch timeline for selected incident
  const { data: timeline = [] } = useQuery<IncidentTimeline[]>({
    queryKey: ["/api/incidents", selectedIncidentId, "timeline"],
    enabled: !!selectedIncidentId,
  });

  // Calculate summary metrics
  const metrics: MetricTile[] = useMemo(() => {
    const criticalCount = incidents.filter(i => i.priority === 'critical' && i.status !== 'resolved').length;
    const activeCount = incidents.filter(i => i.status !== 'resolved').length;
    const inProgressCount = incidents.filter(i => i.status === 'in_progress').length;
    const resolvedToday = incidents.filter(i => {
      if (i.status !== 'resolved') return false;
      const today = new Date().toDateString();
      return new Date(i.updatedAt).toDateString() === today;
    }).length;

    return [
      {
        id: "critical",
        label: "Critical",
        value: criticalCount,
        icon: AlertTriangle,
        variant: criticalCount > 0 ? "critical" : "default",
      },
      {
        id: "active",
        label: "Active",
        value: activeCount,
        icon: LayoutDashboard,
        variant: activeCount > 5 ? "high" : "default",
      },
      {
        id: "in-progress",
        label: "In Progress",
        value: inProgressCount,
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
        actor: "Admin Portal",
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
        actor: "Admin Portal",
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
        actor: "Admin Portal",
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

  if (!property) {
    return (
      <AppLayout
        title="Property Not Found"
        navSections={navSections}
        homeRoute="/admin"
        notificationCount={0}
      >
        <div className="text-center py-12">
          <p className="text-muted-foreground">Property not found</p>
          <Button asChild className="mt-4">
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Portfolio
            </Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title={`Property: ${property.name}`}
      navSections={navSections}
      homeRoute="/admin"
      notificationCount={incidents.filter(i => i.status === 'new').length}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild data-testid="button-back">
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold" data-testid="text-property-name">{property.name}</h1>
              <Badge variant={statusVariant} data-testid="badge-property-status">
                {statusLabel}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{property.location}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Active Incidents</div>
              <div className="text-3xl font-bold" data-testid="text-active-incidents">
                {activeIncidentCount}
              </div>
            </div>
            <ReportIncidentDialog />
          </div>
        </div>

        <SummaryMetrics metrics={metrics} />

        <div>
          <h2 className="text-2xl font-bold mb-4">Incidents</h2>
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
