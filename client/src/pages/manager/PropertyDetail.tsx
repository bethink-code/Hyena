import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
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
  AlertTriangle,
  BarChart3,
  FileText,
  MessageSquare,
  Wifi,
  ArrowLeft,
  MapPin,
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
        { title: "Dashboard", href: "/manager", icon: LayoutDashboard },
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
        title: "Incident Escalated",
        description: "Priority has been increased",
      });
    },
  });

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const selectedIncidentDetails = selectedIncidentId 
    ? incidents.find(i => i.id === selectedIncidentId)
    : null;

  const incidentDetailProps: IncidentDetailProps | null = selectedIncidentDetails
    ? {
        id: selectedIncidentDetails.id,
        title: selectedIncidentDetails.title,
        description: selectedIncidentDetails.description,
        priority: selectedIncidentDetails.priority as any,
        status: selectedIncidentDetails.status as any,
        location: selectedIncidentDetails.location || undefined,
        assignedTo: selectedIncidentDetails.assignedTo || undefined,
        timestamp: formatTimestamp(selectedIncidentDetails.createdAt),
        category: selectedIncidentDetails.category || undefined,
        affectedGuests: selectedIncidentDetails.affectedGuests || undefined,
        estimatedResolution: selectedIncidentDetails.estimatedResolution || undefined,
        rootCause: selectedIncidentDetails.rootCause || undefined,
        resolution: selectedIncidentDetails.resolution || undefined,
        timeline: timeline.map(t => ({
          action: t.action,
          actor: t.actor,
          timestamp: formatTimestamp(t.timestamp),
        })),
      }
    : null;

  if (!property) {
    return (
      <AppLayout
        title="Property Management Dashboard"
        homeRoute="/manager"
        navSections={navSections}
      >
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Property Not Found</h2>
            <p className="text-muted-foreground mb-6">The property you're looking for doesn't exist.</p>
            <Link href="/manager">
              <Button variant="outline" data-testid="button-back-to-properties">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Property Management Dashboard"
      homeRoute="/manager"
      navSections={navSections}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Property Header */}
        <div className="mb-6">
          <Link href="/manager">
            <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold" data-testid="text-property-name">{property.name}</h2>
                <Badge variant={statusVariant} data-testid="badge-property-status">
                  {statusLabel}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span data-testid="text-property-location">{property.location}</span>
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
        </div>

        {/* Incident Queue */}
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

      {/* Incident Detail Panel */}
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
