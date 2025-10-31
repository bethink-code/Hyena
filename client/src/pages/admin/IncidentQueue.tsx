import { useState, useMemo, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { HyenaLogo } from "@/components/HyenaLogo";
import { IncidentQueue } from "@/components/IncidentQueue";
import { IncidentDetailPanel, type IncidentDetailProps } from "@/components/IncidentDetailPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PROPERTIES } from "@/lib/properties";
import type { Incident, IncidentTimeline } from "@shared/schema";
import { ADMIN_NAV } from "@/config/navigation";
import {
  ArrowLeft,
  Filter,
} from "lucide-react";

export default function AdminIncidentQueue() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState(window.location.search);
  
  // Update search params when location changes
  useEffect(() => {
    setSearchParams(window.location.search);
  }, [location]);
  
  // Parse URL query parameters - recompute when search params change
  const statusFilter = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    return params.get('status') || undefined;
  }, [searchParams]);
  
  const priorityFilter = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    return params.get('priority') || undefined;
  }, [searchParams]);
  
  const propertyIdFilter = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    return params.get('propertyId') || undefined;
  }, [searchParams]);

  // Clear all filters
  const clearFilters = () => {
    setSearchParams(''); // Clear search params state immediately
    setLocation('/admin/incidents');
  };

  // Fetch all incidents (admin sees all properties)
  const { data: allIncidents = [] } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
  });

  // Filter incidents based on URL filters
  const incidents = useMemo(() => {
    let filtered = allIncidents;
    
    // If NO status filter provided, show only active work items (exclude terminal statuses)
    // This ensures "Active Incidents" shows active work, not cancelled/duplicate/resolved incidents
    if (!statusFilter) {
      filtered = filtered.filter(i => 
        i.status !== 'resolved' && 
        i.status !== 'cancelled' && 
        i.status !== 'duplicate'
      );
    } else {
      // If status filter IS provided, respect it (allows viewing resolved/cancelled if needed)
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
  }, [allIncidents, statusFilter, priorityFilter, propertyIdFilter]);

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
        actor: "Admin Center",
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
        actor: "Admin Center",
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
        actor: "Admin Center",
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
    const parts: JSX.Element[] = [];
    
    if (propertyIdFilter) {
      const property = PROPERTIES.find(p => p.id === propertyIdFilter);
      if (property) {
        parts.push(
          <Badge key="property" className="bg-[#f29d00f5] text-[#fafafa] text-[16px] font-normal border-transparent">
            {property.name}
          </Badge>
        );
      }
    }
    
    if (statusFilter) {
      parts.push(<span key="status">{statusFilter.replace('_', ' ')}</span>);
    }
    
    if (priorityFilter) {
      parts.push(<span key="priority">{priorityFilter} priority</span>);
    }
    
    if (parts.length === 0) {
      return <span>All incidents across all properties</span>;
    }
    
    return (
      <>
        {parts.map((part, index) => (
          <span key={index}>
            {part}
            {index < parts.length - 1 && <span className="mx-2">•</span>}
          </span>
        ))}
      </>
    );
  };

  return (
    <AppLayout
      title="Platform Administration Center"
      homeRoute="/admin"
      navSections={ADMIN_NAV}
      sidebarHeader={<HyenaLogo />}
      notificationCount={allIncidents.filter(i => i.status === 'new').length}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="mb-3" data-testid="button-back">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h2 className="text-2xl font-bold mb-1">Portfolio Incident Queue</h2>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Filter className="h-4 w-4" />
              <div data-testid="text-filter-description" className="flex items-center">
                {getFilterDescription()}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Showing</div>
            <div className="text-3xl font-bold" data-testid="text-incident-count">
              {incidents.length}
            </div>
            <div className="text-sm text-muted-foreground">incidents</div>
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
          initialStatusFilter={statusFilter}
          initialPriorityFilter={priorityFilter}
          selectedPropertyId={propertyIdFilter}
          onClearFilters={clearFilters}
        />
      </div>

      {/* Incident Detail Panel */}
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
