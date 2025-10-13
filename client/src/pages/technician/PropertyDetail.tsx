import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { IncidentQueue } from "@/components/IncidentQueue";
import { IncidentDetailPanel, type IncidentDetailProps } from "@/components/IncidentDetailPanel";
import { ReportIncidentDialog } from "@/components/ReportIncidentDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getPropertyById } from "@/lib/properties";
import type { Incident, IncidentTimeline } from "@shared/schema";
import {
  ClipboardList,
  History,
  Calendar,
  Wrench,
  ArrowLeft,
  MapPin,
  Camera,
  CheckCircle2,
  Play,
} from "lucide-react";

export default function TechnicianPropertyDetail() {
  const { toast } = useToast();
  const params = useParams<{ id: string }>();
  const propertyId = params.id;
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const [viewingIncidentId, setViewingIncidentId] = useState<string | null>(null);

  // Find property details from shared constants
  const property = getPropertyById(propertyId || "");

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

  // Filter incidents for work queue (assigned or in_progress)
  const workQueue = incidents.filter(i => 
    i.status === 'assigned' || i.status === 'in_progress'
  );

  // Filter incidents for completed work
  const completedWork = incidents.filter(i => i.status === 'resolved');

  // Fetch timeline for selected incident
  const { data: timeline = [] } = useQuery<IncidentTimeline[]>({
    queryKey: ["/api/incidents", viewingIncidentId, "timeline"],
    enabled: !!viewingIncidentId,
  });

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
      queryClient.invalidateQueries({ queryKey: ["/api/incidents", viewingIncidentId, "timeline"] });
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
      setViewingIncidentId(null);
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

  const convertToIncidentProps = (incidents: Incident[]) => {
    return incidents.map(incident => ({
      id: incident.id,
      title: incident.title,
      description: incident.description,
      priority: incident.priority as any,
      status: incident.status as any,
      location: incident.location || undefined,
      assignedTo: incident.assignedTo || undefined,
      timestamp: formatTimestamp(incident.createdAt),
    }));
  };

  const convertToIncidentDetail = (incident: Incident): IncidentDetailProps => ({
    id: incident.id,
    title: incident.title,
    description: incident.description,
    priority: incident.priority as any,
    status: incident.status as any,
    location: incident.location || undefined,
    assignedTo: incident.assignedTo || undefined,
    timestamp: formatTimestamp(incident.createdAt),
    category: incident.category || undefined,
    affectedGuests: incident.affectedGuests || undefined,
    estimatedResolution: incident.estimatedResolution || undefined,
    rootCause: incident.rootCause || undefined,
    resolution: incident.resolution || undefined,
    timeline: timeline.map(t => ({
      action: t.action,
      actor: t.actor,
      timestamp: formatTimestamp(t.timestamp),
    })),
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
      case "degraded":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
      case "critical":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
      case "offline":
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
    }
  };

  if (!property) {
    return (
      <AppLayout
        title="Property Not Found"
        homeRoute="/technician"
        navSections={navSections}
        notificationCount={0}
      >
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Property Not Found</h2>
          <p className="text-muted-foreground mb-6">The property you're looking for doesn't exist.</p>
          <Link href="/technician">
            <Button variant="outline" data-testid="button-back-to-dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title={property.name}
      homeRoute="/technician"
      notificationCount={workQueue.length}
      navSections={navSections}
    >
      <div className="space-y-6">
        {/* Property Header */}
        <div>
          <Link href="/technician">
            <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold" data-testid="text-property-name">{property.name}</h1>
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

        {/* Tabs for Work Queue and Completed Work */}
        <Tabs defaultValue="work-queue" className="w-full">
          <TabsList>
            <TabsTrigger value="work-queue" data-testid="tab-work-queue">
              Work Queue ({workQueue.length})
            </TabsTrigger>
            <TabsTrigger value="completed" data-testid="tab-completed">
              Completed Work ({completedWork.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="work-queue" className="mt-6 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Active incidents at this property</p>
            </div>

            <IncidentQueue 
              incidents={convertToIncidentProps(workQueue)}
              onIncidentClick={(incidentId) => {
                setSelectedIncident(incidentId);
                setViewingIncidentId(incidentId);
              }}
            />

            {selectedIncident && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Incident Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {workQueue.find(i => i.id === selectedIncident)?.status === 'assigned' && (
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
          </TabsContent>

          <TabsContent value="completed" className="mt-6 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Resolved incidents at this property</p>
            </div>

            <IncidentQueue 
              incidents={convertToIncidentProps(completedWork)}
              onIncidentClick={(incidentId) => setViewingIncidentId(incidentId)}
            />
          </TabsContent>
        </Tabs>
      </div>

      <IncidentDetailPanel
        incident={viewingIncidentId ? (() => {
          const incident = allIncidents.find(i => i.id === viewingIncidentId);
          return incident ? convertToIncidentDetail(incident) : null;
        })() : null}
        open={viewingIncidentId !== null}
        onClose={() => setViewingIncidentId(null)}
      />
    </AppLayout>
  );
}
