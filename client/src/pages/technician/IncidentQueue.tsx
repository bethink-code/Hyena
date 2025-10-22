import { useState, useMemo } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { IncidentQueue } from "@/components/IncidentQueue";
import { IncidentDetailPanel, type IncidentDetailProps } from "@/components/IncidentDetailPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PROPERTIES } from "@/lib/properties";
import type { Incident, IncidentTimeline } from "@shared/schema";
import {
  LayoutDashboard,
  Wrench,
  Calendar,
  CheckCircle2,
  Package,
  ArrowLeft,
  Filter,
} from "lucide-react";

export default function TechnicianIncidentQueue() {
  const { toast } = useToast();
  const [location] = useLocation();
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  
  // Parse URL query parameters
  const params = new URLSearchParams(window.location.search);
  const statusFilter = params.get('status') || undefined;
  const priorityFilter = params.get('priority') || undefined;
  const propertyIdFilter = params.get('propertyId') || undefined;

  // Use the last 3 properties for the technician's scope
  const technicianProperties = PROPERTIES.slice(3, 6);
  const technicianPropertyIds = technicianProperties.map(p => p.id);

  const navSections = [
    {
      label: "Main",
      items: [
        { title: "My Work", href: "/technician", icon: LayoutDashboard },
        { title: "Schedule", href: "/technician/schedule", icon: Calendar },
      ],
    },
    {
      label: "Tasks",
      items: [
        { title: "Completed Jobs", href: "/technician/completed", icon: CheckCircle2 },
        { title: "Equipment", href: "/technician/equipment", icon: Package },
      ],
    },
  ];

  // Fetch all incidents
  const { data: allIncidents = [] } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
  });

  // Filter incidents for technician's properties and apply URL filters
  const incidents = useMemo(() => {
    // Technician only sees incidents from their assigned properties
    let filtered = allIncidents.filter(i => technicianPropertyIds.includes(i.propertyId || ''));
    
    // Apply status filter from URL
    if (statusFilter) {
      filtered = filtered.filter(i => i.status === statusFilter);
    }
    
    // Apply priority filter from URL
    if (priorityFilter) {
      filtered = filtered.filter(i => i.priority === priorityFilter);
    }
    
    // Apply property filter from URL
    if (propertyIdFilter) {
      filtered = filtered.filter(i => i.propertyId === propertyIdFilter);
    }
    
    return filtered;
  }, [allIncidents, statusFilter, priorityFilter, propertyIdFilter, technicianPropertyIds]);

  // Fetch timeline for selected incident
  const { data: timeline = [] } = useQuery<IncidentTimeline[]>({
    queryKey: ["/api/incidents", selectedIncidentId, "timeline"],
    enabled: !!selectedIncidentId,
  });

  // Start work mutation
  const startWorkMutation = useMutation({
    mutationFn: async (incidentId: string) => {
      const response = await apiRequest("PATCH", `/api/incidents/${incidentId}`, {
        status: "in_progress",
        assignedTo: "Tech Team",
      });
      const incident = await response.json();
      
      await apiRequest("POST", `/api/incidents/${incidentId}/timeline`, {
        action: "Started working on incident",
        actor: "Technician App",
      });
      
      return incident;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/incidents", selectedIncidentId, "timeline"] });
      toast({
        title: "Work Started",
        description: "You're now working on this incident",
      });
    },
  });

  // Complete work mutation
  const completeWorkMutation = useMutation({
    mutationFn: async (incidentId: string) => {
      const response = await apiRequest("PATCH", `/api/incidents/${incidentId}`, {
        status: "resolved",
      });
      const incident = await response.json();
      
      await apiRequest("POST", `/api/incidents/${incidentId}/timeline`, {
        action: "Incident resolved",
        actor: "Technician App",
      });
      
      return incident;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/incidents", selectedIncidentId, "timeline"] });
      toast({
        title: "Work Completed",
        description: "Incident has been resolved",
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
        actor: "Technician App",
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

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

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
        timestamp: formatTimestamp(selectedIncident.createdAt),
        category: selectedIncident.category || undefined,
        affectedGuests: selectedIncident.affectedGuests || undefined,
        estimatedResolution: selectedIncident.estimatedResolution || undefined,
        rootCause: selectedIncident.rootCause || undefined,
        resolution: selectedIncident.resolution || undefined,
        timeline: timeline.map((t) => ({
          timestamp: formatTimestamp(t.timestamp),
          action: t.action,
          actor: t.actor,
        })),
      }
    : null;

  // Get filter description for header
  const getFilterDescription = () => {
    const parts: string[] = [];
    
    if (propertyIdFilter) {
      const property = PROPERTIES.find(p => p.id === propertyIdFilter);
      if (property) parts.push(property.name);
    }
    
    if (statusFilter) {
      parts.push(statusFilter.replace('_', ' '));
    }
    
    if (priorityFilter) {
      parts.push(`${priorityFilter} priority`);
    }
    
    return parts.length > 0 ? parts.join(' • ') : 'All my work queue items';
  };

  return (
    <AppLayout
      title="Technician Work Queue"
      homeRoute="/technician"
      navSections={navSections}
      notificationCount={allIncidents.filter(i => 
        technicianPropertyIds.includes(i.propertyId || '') && i.status === 'new'
      ).length}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href="/technician">
              <Button variant="ghost" size="sm" className="mb-3" data-testid="button-back">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h2 className="text-2xl font-bold mb-1">Work Queue</h2>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span data-testid="text-filter-description">{getFilterDescription()}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Showing</div>
            <div className="text-3xl font-bold" data-testid="text-incident-count">
              {incidents.length}
            </div>
            <div className="text-sm text-muted-foreground">tasks</div>
          </div>
        </div>

        {/* Active Filters Badge Display */}
        {(statusFilter || priorityFilter || propertyIdFilter) && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {propertyIdFilter && (
              <Badge variant="secondary" data-testid="badge-filter-property">
                Property: {PROPERTIES.find(p => p.id === propertyIdFilter)?.name}
              </Badge>
            )}
            {statusFilter && (
              <Badge variant="secondary" data-testid="badge-filter-status">
                Status: {statusFilter.replace('_', ' ')}
              </Badge>
            )}
            {priorityFilter && (
              <Badge variant="secondary" data-testid="badge-filter-priority">
                Priority: {priorityFilter}
              </Badge>
            )}
          </div>
        )}

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
          startWorkMutation.mutate(id);
        }}
        onResolve={(id) => {
          completeWorkMutation.mutate(id);
        }}
        onEscalate={(id) => {
          escalateIncidentMutation.mutate(id);
        }}
      />
    </AppLayout>
  );
}
