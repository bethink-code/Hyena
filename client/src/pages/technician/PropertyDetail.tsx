import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { EventQueue } from "@/components/EventQueue";
import { EventDetailPanel, type EventDetailProps } from "@/components/EventDetailPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getPropertyById } from "@/lib/properties";
import type { Event, EventTimeline } from "@shared/schema";
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
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [viewingEventId, setViewingEventId] = useState<string | null>(null);

  // Find property details from shared constants
  const property = getPropertyById(propertyId || "");

  const navSections = [
    {
      label: "Work",
      items: [
        { title: "Work Queue", href: "/technician", icon: ClipboardList },
        { title: "Completed Jobs", href: "/technician/completed", icon: History },
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

  // Fetch all events
  const { data: allEvents = [] } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  // Filter events by selected property
  const events = allEvents.filter(e => e.propertyId === propertyId);

  // Filter events for work queue (assigned or in_progress)
  const workQueue = events.filter(e => 
    e.status === 'assigned' || e.status === 'in_progress'
  );

  // Filter events for completed work
  const completedWork = events.filter(e => e.status === 'resolved');

  // Fetch timeline for selected event
  const { data: timeline = [] } = useQuery<EventTimeline[]>({
    queryKey: ["/api/events", viewingEventId, "timeline"],
    enabled: !!viewingEventId,
  });

  // Start work mutation
  const startWorkMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await apiRequest("PATCH", `/api/events/${eventId}`, {
        status: "in_progress",
      });
      const event = await response.json();
      
      await apiRequest("POST", `/api/events/${eventId}/timeline`, {
        action: "Technician started working on issue",
        actor: "Technician App",
      });
      
      return event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events", viewingEventId, "timeline"] });
      toast({
        title: "Work Started",
        description: "Event marked as in progress",
      });
    },
  });

  // Resolve event mutation
  const resolveEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await apiRequest("PATCH", `/api/events/${eventId}`, {
        status: "resolved",
      });
      const event = await response.json();
      
      await apiRequest("POST", `/api/events/${eventId}/timeline`, {
        action: "Event resolved by technician",
        actor: "Technician App",
      });
      
      return event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events", viewingEventId, "timeline"] });
      toast({
        title: "Event Resolved",
        description: "Event has been marked as resolved",
      });
      setSelectedEvent(null);
      setViewingEventId(null);
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

  const convertToEventProps = (events: Event[]) => {
    return events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      priority: event.priority as any,
      status: event.status as any,
      location: event.location || undefined,
      assignedTo: event.assignedTo || undefined,
      timestamp: formatTimestamp(event.createdAt),
    }));
  };

  const convertToEventDetail = (event: Event): EventDetailProps => ({
    id: event.id,
    title: event.title,
    description: event.description,
    priority: event.priority as any,
    status: event.status as any,
    location: event.location || undefined,
    assignedTo: event.assignedTo || undefined,
    timestamp: formatTimestamp(event.createdAt),
    category: event.category || undefined,
    affectedGuests: event.affectedGuests || undefined,
    estimatedResolution: event.estimatedResolution || undefined,
    rootCause: event.rootCause || undefined,
    resolution: event.resolution || undefined,
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
      >
        <div className="container mx-auto px-4 py-8 max-w-7xl">
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
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Property Header */}
        <div className="mb-6">
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
                <Badge className={getStatusColor(property.status)} data-testid={`badge-status-${property.status}`}>
                  {property.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span data-testid="text-property-location">{property.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Work Queue */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-1">Work Queue ({workQueue.length})</h2>
            <p className="text-sm text-muted-foreground">Active incidents at this property</p>
          </div>

          <EventQueue 
            events={convertToEventProps(workQueue)}
            onEventClick={(eventId) => {
              setSelectedEvent(eventId);
              setViewingEventId(eventId);
            }}
          />

          {selectedEvent && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Incident Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {workQueue.find(e => e.id === selectedEvent)?.status === 'assigned' && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => startWorkMutation.mutate(selectedEvent)}
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
                  onClick={() => resolveEventMutation.mutate(selectedEvent)}
                  data-testid="button-resolve"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark as Resolved
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Completed Work */}
        <div className="space-y-4 mt-8">
          <div>
            <h2 className="text-xl font-semibold mb-1">Completed Work ({completedWork.length})</h2>
            <p className="text-sm text-muted-foreground">Resolved incidents at this property</p>
          </div>

          <EventQueue 
            events={convertToEventProps(completedWork)}
            onEventClick={(eventId) => setViewingEventId(eventId)}
          />
        </div>
      </div>

      <EventDetailPanel
        event={viewingEventId ? (() => {
          const event = allEvents.find(e => e.id === viewingEventId);
          return event ? convertToEventDetail(event) : null;
        })() : null}
        open={viewingEventId !== null}
        onClose={() => setViewingEventId(null)}
      />
    </AppLayout>
  );
}
