import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { PropertyList } from "@/components/PropertyList";
import { SummaryMetrics, type MetricTile } from "@/components/SummaryMetrics";
import { IncidentQueue } from "@/components/IncidentQueue";
import { IncidentDetailPanel, type IncidentDetailProps } from "@/components/IncidentDetailPanel";
import { LogIssueDialog } from "@/components/LogIssueDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PROPERTIES } from "@/lib/properties";
import type { Incident, IncidentTimeline } from "@shared/schema";
import { 
  MapPin, 
  Camera, 
  CheckCircle2, 
  ClipboardList, 
  History, 
  Calendar, 
  Wrench, 
  Play,
  AlertTriangle,
  Clock,
  TrendingUp,
} from "lucide-react";

export default function TechnicianApp() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const [viewingIncidentId, setViewingIncidentId] = useState<string | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("all");

  // Technician works across these three properties
  const technicianProperties = PROPERTIES.filter(p => 
    ["1", "2", "3"].includes(p.id)
  );

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

  // Filter incidents for technician's properties
  const technicianPropertyIds = ["1", "2", "3"];
  const technicianIncidents = useMemo(() => {
    const filtered = allIncidents.filter(i => 
      technicianPropertyIds.includes(i.propertyId)
    );
    
    if (selectedPropertyId === "all") {
      return filtered;
    }
    
    return filtered.filter(i => i.propertyId === selectedPropertyId);
  }, [allIncidents, selectedPropertyId]);

  // Fetch timeline for selected incident
  const { data: timeline = [] } = useQuery<IncidentTimeline[]>({
    queryKey: ["/api/incidents", viewingIncidentId, "timeline"],
    enabled: !!viewingIncidentId,
  });

  // Calculate summary metrics
  const metrics: MetricTile[] = useMemo(() => {
    const myQueue = technicianIncidents.filter(i => 
      i.status === 'assigned' || i.status === 'in_progress'
    ).length;
    const inProgress = technicianIncidents.filter(i => i.status === 'in_progress').length;
    const completedToday = technicianIncidents.filter(i => {
      if (i.status !== 'resolved') return false;
      const today = new Date().toDateString();
      return new Date(i.updatedAt).toDateString() === today;
    }).length;
    const criticalCount = technicianIncidents.filter(i => 
      i.priority === 'critical' && i.status !== 'resolved'
    ).length;

    return [
      {
        id: "my-queue",
        label: "My Queue",
        value: myQueue,
        icon: ClipboardList,
        variant: myQueue > 5 ? "high" : "default",
      },
      {
        id: "in-progress",
        label: "In Progress",
        value: inProgress,
        icon: Play,
        variant: "medium",
      },
      {
        id: "completed-today",
        label: "Completed Today",
        value: completedToday,
        icon: CheckCircle2,
        variant: "success",
      },
      {
        id: "critical",
        label: "Critical",
        value: criticalCount,
        icon: AlertTriangle,
        variant: criticalCount > 0 ? "critical" : "default",
      },
    ];
  }, [technicianIncidents]);

  // Start work mutation
  const startWorkMutation = useMutation({
    mutationFn: async (incidentId: string) => {
      const response = await apiRequest("PATCH", `/api/incidents/${incidentId}`, {
        status: "in_progress",
      });
      const incident = await response.json();
      
      await apiRequest("POST", `/api/incidents/${incidentId}/timeline`, {
        action: "Technician started working on issue",
        actor: "Technician App",
      });
      
      return incident;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      toast({
        title: "Work Started",
        description: "Incident marked as in progress",
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
        action: "Incident resolved by technician",
        actor: "Technician App",
      });
      
      return incident;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/incidents", viewingIncidentId, "timeline"] });
      toast({
        title: "Incident Resolved",
        description: "Incident has been marked as resolved",
      });
      setSelectedIncident(null);
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

  const viewingIncident = viewingIncidentId 
    ? technicianIncidents.find(i => i.id === viewingIncidentId)
    : null;

  const incidentDetailProps: IncidentDetailProps | null = viewingIncident
    ? {
        id: viewingIncident.id,
        title: viewingIncident.title,
        description: viewingIncident.description,
        priority: viewingIncident.priority as any,
        status: viewingIncident.status as any,
        location: viewingIncident.location || undefined,
        assignedTo: viewingIncident.assignedTo || undefined,
        timestamp: new Date(viewingIncident.createdAt).toLocaleString(),
        category: viewingIncident.category || undefined,
        affectedGuests: viewingIncident.affectedGuests || undefined,
        estimatedResolution: viewingIncident.estimatedResolution || undefined,
        rootCause: viewingIncident.rootCause || undefined,
        resolution: viewingIncident.resolution || undefined,
        timeline: timeline.map((t) => ({
          timestamp: new Date(t.timestamp).toLocaleTimeString(),
          action: t.action,
          actor: t.actor,
        })),
      }
    : null;

  return (
    <AppLayout
      title="Technician App"
      homeRoute="/technician"
      notificationCount={technicianIncidents.filter(i => i.status === 'assigned' || i.status === 'in_progress').length}
      navSections={navSections}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        {/* Property Status Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">My Properties</h2>
            <p className="text-muted-foreground">Properties assigned to your coverage area</p>
          </div>
          
          <PropertyList
            properties={technicianProperties.map(property => {
              const activeIncidents = allIncidents.filter(
                i => i.propertyId === property.id && 
                (i.status === 'new' || i.status === 'assigned' || i.status === 'in_progress')
              );
              const incidentCount = activeIncidents.length;
              const criticalCount = activeIncidents.filter(i => i.priority === 'critical').length;
              const newCount = activeIncidents.filter(i => i.status === 'new').length;
              
              return {
                ...property,
                incidentCount,
                criticalCount,
                newCount,
              };
            })}
            onPropertyClick={(property) => navigate(`/technician/properties/${property.id}`)}
          />
        </div>

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

        {/* Incident Queue */}
        <IncidentQueue 
          incidents={technicianIncidents.map((incident) => ({
            id: incident.id,
            title: incident.title,
            description: incident.description,
            priority: incident.priority as any,
            status: incident.status as any,
            location: incident.location || undefined,
            assignedTo: incident.assignedTo || undefined,
            timestamp: formatTimestamp(incident.createdAt),
          }))}
          onIncidentClick={(incidentId) => {
            setSelectedIncident(incidentId);
            setViewingIncidentId(incidentId);
          }}
          properties={technicianProperties}
          selectedPropertyId={selectedPropertyId}
          onPropertyChange={setSelectedPropertyId}
          showPropertyFilter={true}
        />
        
        {selectedIncident && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Incident Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {technicianIncidents.find(i => i.id === selectedIncident)?.status === 'assigned' && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => startWorkMutation.mutate(selectedIncident)}
                  data-testid="button-start-work"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Working
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => console.log("Navigate to location")}
                data-testid="button-navigate"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Navigate to Location
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => console.log("Upload photo")}
                data-testid="button-upload-photo"
              >
                <Camera className="h-4 w-4 mr-2" />
                Upload Photo/Documentation
              </Button>
              <Button
                className="w-full"
                onClick={() => resolveIncidentMutation.mutate(selectedIncident)}
                data-testid="button-resolve"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark as Resolved
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <IncidentDetailPanel
        incident={incidentDetailProps}
        open={!!viewingIncidentId}
        onClose={() => setViewingIncidentId(null)}
        onResolve={(id) => {
          resolveIncidentMutation.mutate(id);
        }}
      />
    </AppLayout>
  );
}
