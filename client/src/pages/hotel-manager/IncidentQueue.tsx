import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { OrganizationLogo } from "@/components/OrganizationLogo";
import { useActiveOrganization } from "@/hooks/use-active-organization";
import { IncidentQueue } from "@/components/IncidentQueue";
import { IncidentDetailPanel, type IncidentDetailProps } from "@/components/IncidentDetailPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Incident, IncidentTimeline } from "@shared/schema";
import {
  LayoutDashboard,
  AlertTriangle,
  BarChart3,
  FileText,
  MessageSquare,
  Wifi,
  Filter,
} from "lucide-react";

export default function IncidentQueuePage() {
  const { data: activeOrg } = useActiveOrganization();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState(window.location.search);
  
  // PROTOTYPE NOTE: In production, propertyId would be loaded from authenticated user session
  // For demonstration, this shows the hotel manager experience for property "1"
  const propertyId = "1";

  useEffect(() => {
    setSearchParams(window.location.search);
  }, [location]);
  
  const statusFilter = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    return params.get('status') || undefined;
  }, [searchParams]);
  
  const priorityFilter = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    return params.get('priority') || undefined;
  }, [searchParams]);

  const clearFilters = () => {
    setSearchParams('');
    setLocation('/hotel-manager/incidents');
  };

  const navSections = [
    {
      label: "Main",
      items: [
        { title: "Dashboard", href: "/hotel-manager", icon: LayoutDashboard },
        { title: "Incident Queue", href: "/hotel-manager/incidents", icon: AlertTriangle },
        { title: "Network Status", href: "/hotel-manager/network", icon: Wifi },
      ],
    },
    {
      label: "Analysis",
      items: [
        { title: "Analytics", href: "/hotel-manager/analytics", icon: BarChart3 },
        { title: "Analytics & Reports", href: "/hotel-manager/analytics", icon: FileText },
      ],
    },
  ];

  const { data: allIncidents = [] } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
  });

  const incidents = useMemo(() => {
    let filtered = allIncidents.filter(i => i.propertyId === propertyId);
    
    if (!statusFilter) {
      filtered = filtered.filter(i => 
        i.status !== 'resolved' && 
        i.status !== 'cancelled' && 
        i.status !== 'duplicate'
      );
    } else {
      filtered = filtered.filter(i => i.status === statusFilter);
    }
    
    if (priorityFilter) {
      filtered = filtered.filter(i => i.priority === priorityFilter);
    }
    
    return filtered;
  }, [allIncidents, statusFilter, priorityFilter]);

  const { data: timeline = [] } = useQuery<IncidentTimeline[]>({
    queryKey: ["/api/incidents", selectedIncidentId, "timeline"],
    enabled: !!selectedIncidentId,
  });

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
  });

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
  });

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

  const hasActiveFilters = statusFilter || priorityFilter;

  return (
    <AppLayout
      title="Incident Queue"
      navSections={navSections}
      homeRoute="/hotel-manager"
      notificationCount={incidents.filter(i => i.status === 'new').length}
      sidebarHeader={activeOrg && <OrganizationLogo organizationId={activeOrg.id} />}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold mb-1">Incident Queue</h2>
            <p className="text-muted-foreground">Active incidents for your property</p>
          </div>
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              data-testid="button-clear-filters"
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>

        {hasActiveFilters && (
          <div className="flex gap-2 flex-wrap">
            {statusFilter && (
              <Badge variant="outline">Status: {statusFilter}</Badge>
            )}
            {priorityFilter && (
              <Badge variant="outline">Priority: {priorityFilter}</Badge>
            )}
          </div>
        )}

        <IncidentQueue
          incidents={incidents.map((incident) => ({
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
