import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { EventQueue } from "@/components/EventQueue";
import { EventDetailPanel, type EventDetailProps } from "@/components/EventDetailPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Event, EventTimeline } from "@shared/schema";
import {
  LayoutDashboard,
  Building2,
  Users as UsersIcon,
  Settings,
  BarChart3,
  FileText,
  Puzzle,
  Shield,
  ArrowLeft,
  MapPin,
} from "lucide-react";

const PROPERTIES = [
  { id: "1", name: "The Table Bay Hotel", location: "Cape Town, Western Cape", status: "healthy" as const },
  { id: "2", name: "Umhlanga Sands Resort", location: "Durban, KwaZulu-Natal", status: "degraded" as const },
  { id: "3", name: "Saxon Hotel", location: "Johannesburg, Gauteng", status: "critical" as const },
  { id: "4", name: "Sandton Sun Hotel", location: "Sandton, Gauteng", status: "healthy" as const },
  { id: "5", name: "Waterfront Lodge", location: "Cape Town, Western Cape", status: "degraded" as const },
  { id: "6", name: "Kruger Park Lodge", location: "Mpumalanga", status: "healthy" as const },
  { id: "7", name: "Plettenberg Bay Resort", location: "Plettenberg Bay, Western Cape", status: "healthy" as const },
  { id: "8", name: "Durban Beachfront Hotel", location: "Durban, KwaZulu-Natal", status: "degraded" as const },
];

export default function PropertyDetail() {
  const { toast } = useToast();
  const params = useParams<{ id: string }>();
  const propertyId = params.id;
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Find property details
  const property = PROPERTIES.find(p => p.id === propertyId);

  const navSections = [
    {
      label: "Overview",
      items: [
        { title: "Portfolio Dashboard", href: "/admin", icon: LayoutDashboard },
        { title: "All Properties", href: "/admin/properties", icon: Building2 },
      ],
    },
    {
      label: "Management",
      items: [
        { title: "Users & Roles", href: "/admin/users", icon: UsersIcon },
        { title: "System Config", href: "/admin/config", icon: Settings },
        { title: "Integrations", href: "/admin/integrations", icon: Puzzle },
      ],
    },
    {
      label: "Reporting",
      items: [
        { title: "Regional Analytics", href: "/admin/analytics", icon: BarChart3 },
        { title: "Reports", href: "/admin/reports", icon: FileText },
        { title: "Audit Logs", href: "/admin/audit", icon: Shield },
      ],
    },
  ];

  // Fetch all events
  const { data: allEvents = [] } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  // Filter events by selected property
  const events = allEvents.filter(e => e.propertyId === propertyId);

  // Fetch timeline for selected event
  const { data: timeline = [] } = useQuery<EventTimeline[]>({
    queryKey: ["/api/events", selectedEventId, "timeline"],
    enabled: !!selectedEventId,
  });

  // Assign event mutation
  const assignEventMutation = useMutation({
    mutationFn: async ({ eventId, assignedTo }: { eventId: string; assignedTo: string }) => {
      const response = await apiRequest("PATCH", `/api/events/${eventId}`, {
        status: "assigned",
        assignedTo,
      });
      const event = await response.json();
      
      await apiRequest("POST", `/api/events/${eventId}/timeline`, {
        action: `Assigned to ${assignedTo}`,
        actor: "Admin Portal",
      });
      
      return event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events", selectedEventId, "timeline"] });
      toast({
        title: "Event Assigned",
        description: "Technician has been notified",
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
        action: "Event marked as resolved",
        actor: "Admin Portal",
      });
      
      return event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events", selectedEventId, "timeline"] });
      toast({
        title: "Event Resolved",
        description: "Event has been marked as resolved",
      });
      setSelectedEventId(null);
    },
  });

  // Escalate event mutation
  const escalateEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const currentEvent = events.find(e => e.id === eventId);
      const newPriority = currentEvent?.priority === 'critical' ? 'critical' : 
                          currentEvent?.priority === 'high' ? 'critical' :
                          currentEvent?.priority === 'medium' ? 'high' : 'medium';
      
      const response = await apiRequest("PATCH", `/api/events/${eventId}`, {
        priority: newPriority,
      });
      const event = await response.json();
      
      await apiRequest("POST", `/api/events/${eventId}/timeline`, {
        action: `Priority escalated to ${newPriority}`,
        actor: "Admin Portal",
      });
      
      return event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events", selectedEventId, "timeline"] });
      toast({
        title: "Event Escalated",
        description: "Priority has been increased",
      });
    },
  });

  const convertToEventDetailProps = (event: Event): EventDetailProps => {
    const formatTimestamp = (date: Date) => {
      const now = new Date();
      const diffMs = now.getTime() - new Date(date).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
      return `${Math.floor(diffMins / 1440)}d ago`;
    };

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      priority: event.priority as any,
      status: event.status as any,
      location: event.location || undefined,
      assignedTo: event.assignedTo || undefined,
      timestamp: event.createdAt ? formatTimestamp(event.createdAt) : "N/A",
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
    };
  };

  const selectedEventDetails = selectedEventId 
    ? events.find(e => e.id === selectedEventId)
    : null;

  const statusVariant = property?.status === "healthy" ? "default" : 
                        property?.status === "degraded" ? "secondary" : 
                        "destructive";

  const statusLabel = property?.status === "healthy" ? "HEALTHY" :
                      property?.status === "degraded" ? "DEGRADED" :
                      "CRITICAL";

  if (!property) {
    return (
      <AppLayout
        title="Property Management"
        homeRoute="/admin"
        navSections={navSections}
      >
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Property Not Found</h2>
            <p className="text-muted-foreground mb-6">The property you're looking for doesn't exist.</p>
            <Link href="/admin/properties">
              <Button variant="outline" data-testid="button-back-to-properties">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to All Properties
              </Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Property Management"
      homeRoute="/admin"
      navSections={navSections}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Property Header */}
        <div className="mb-6">
          <Link href="/admin/properties">
            <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to All Properties
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
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Active Incidents</div>
              <div className="text-3xl font-bold" data-testid="text-incident-count">
                {events.filter(e => e.status !== 'resolved').length}
              </div>
            </div>
          </div>
        </div>

        {/* Event Queue */}
        <EventQueue
          events={events.map(e => convertToEventDetailProps(e))}
          onEventClick={(eventId) => setSelectedEventId(eventId)}
        />
      </div>

      {/* Event Detail Panel */}
      <EventDetailPanel
        event={selectedEventDetails ? convertToEventDetailProps(selectedEventDetails) : null}
        open={!!selectedEventId}
        onClose={() => setSelectedEventId(null)}
        onAssign={(id) => {
          assignEventMutation.mutate({
            eventId: id,
            assignedTo: "John Smith",
          });
        }}
        onResolve={(id) => {
          resolveEventMutation.mutate(id);
        }}
        onEscalate={(id) => {
          escalateEventMutation.mutate(id);
        }}
      />
    </AppLayout>
  );
}
