import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { SummaryMetrics, type MetricTile } from "@/components/SummaryMetrics";
import { IncidentQueue } from "@/components/IncidentQueue";
import { IncidentDetailPanel, type IncidentDetailProps } from "@/components/IncidentDetailPanel";
import { ReportIncidentDialog } from "@/components/ReportIncidentDialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getPropertyById } from "@/lib/properties";
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
  MapPin,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HotelManagerDashboard() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  
  // PROTOTYPE NOTE: In production, propertyId would be loaded from authenticated user session
  // For demonstration, this shows the hotel manager experience for property "1" (The Table Bay Hotel)
  // Additional hotel managers can be created in admin (e.g., Sarah Thompson for property "2")
  const propertyId = "1";
  const property = getPropertyById(propertyId);

  const navSections = [
    {
      label: "Main",
      items: [
        { title: "Dashboard", href: "/hotel-manager", icon: LayoutDashboard },
        { title: "Incidents", href: "/hotel-manager/incidents", icon: AlertTriangle },
        { title: "Network Status", href: "/hotel-manager/network", icon: Wifi },
      ],
    },
    {
      label: "Analysis",
      items: [
        { title: "Analytics", href: "/hotel-manager/analytics", icon: BarChart3 },
        { title: "Reports", href: "/hotel-manager/reports", icon: FileText },
      ],
    },
    {
      label: "Communication",
      items: [
        { title: "Guest Messages", href: "/hotel-manager/messages", icon: MessageSquare },
      ],
    },
  ];

  // Fetch all incidents
  const { data: allIncidents = [] } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
  });

  // Filter incidents for this property only
  const incidents = useMemo(() => {
    return allIncidents.filter(i => i.propertyId === propertyId);
  }, [allIncidents, propertyId]);

  // Fetch timeline for selected incident
  const { data: timeline = [] } = useQuery<IncidentTimeline[]>({
    queryKey: ["/api/incidents", selectedIncidentId, "timeline"],
    enabled: !!selectedIncidentId,
  });

  // Calculate summary metrics for this property
  const metrics: MetricTile[] = useMemo(() => {
    const activeIncidents = incidents.filter(i => 
      i.status !== 'resolved' && 
      i.status !== 'cancelled' && 
      i.status !== 'duplicate'
    );
    
    const criticalCount = activeIncidents.filter(i => i.priority === 'critical').length;
    const activeCount = activeIncidents.length;
    const inProgressCount = activeIncidents.filter(i => i.status === 'in_progress').length;
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
        onClick: () => setLocation('/hotel-manager/incidents?priority=critical'),
      },
      {
        id: "active",
        label: "Active Incidents",
        value: activeCount,
        icon: LayoutDashboard,
        variant: activeCount > 5 ? "high" : "default",
        onClick: () => setLocation('/hotel-manager/incidents'),
      },
      {
        id: "in-progress",
        label: "In Progress",
        value: inProgressCount,
        icon: Clock,
        variant: "medium",
        onClick: () => setLocation('/hotel-manager/incidents?status=in_progress'),
      },
      {
        id: "resolved-today",
        label: "Resolved Today",
        value: resolvedToday,
        icon: CheckCircle2,
        variant: "success",
        onClick: () => setLocation('/hotel-manager/incidents?status=resolved'),
      },
    ];
  }, [incidents, setLocation]);

  // Calculate property status
  const propertyStatus = useMemo(() => {
    const activeIncidents = incidents.filter(i => 
      i.status !== 'resolved' && 
      i.status !== 'cancelled' && 
      i.status !== 'duplicate'
    );
    const hasCritical = activeIncidents.some(i => i.priority === 'critical');
    const activeCount = activeIncidents.length;

    if (hasCritical) return "critical";
    if (activeCount > 3) return "degraded";
    if (activeCount > 0) return "degraded";
    return "healthy";
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
        actor: "Hotel Manager",
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
        actor: "Hotel Manager",
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
        actor: "Hotel Manager",
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

  const statusVariant = propertyStatus === "healthy" ? "default" : 
                        propertyStatus === "degraded" ? "secondary" : 
                        "destructive";
  const statusLabel = propertyStatus.toUpperCase();

  return (
    <AppLayout
      title="Property Management"
      navSections={navSections}
      homeRoute="/hotel-manager"
      notificationCount={incidents.filter(i => i.status === 'new').length}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        {/* Property Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold truncate">{property?.name}</h2>
              <Badge variant={statusVariant} data-testid="badge-property-status">
                {statusLabel}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <p className="truncate">{property?.location}</p>
            </div>
          </div>
          <ReportIncidentDialog />
        </div>

        {/* Summary Metrics */}
        <SummaryMetrics metrics={metrics} />

        {/* Incident Queue */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Active Incidents</h3>
          </div>
          <IncidentQueue
            incidents={incidents
              .filter(i => i.status !== 'resolved' && i.status !== 'cancelled' && i.status !== 'duplicate')
              .map((incident) => ({
                id: incident.id,
                title: incident.title,
                description: incident.description,
                priority: incident.priority as any,
                status: incident.status as any,
                location: incident.location || "Not specified",
                timestamp: new Date(incident.createdAt).toLocaleString(),
                assignedTo: incident.assignedTo || undefined,
              }))}
            onIncidentClick={(id) => setSelectedIncidentId(id)}
            onAssign={(id: string, technicianId: string) => {
              assignIncidentMutation.mutate({ incidentId: id, assignedTo: technicianId });
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
