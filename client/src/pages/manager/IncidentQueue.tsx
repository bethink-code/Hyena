import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { PropertySelector } from "@/components/PropertySelector";
import { EventQueue } from "@/components/EventQueue";
import { EventDetailPanel, type EventDetailProps } from "@/components/EventDetailPanel";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Event, EventTimeline } from "@shared/schema";
import {
  LayoutDashboard,
  AlertTriangle,
  BarChart3,
  FileText,
  MessageSquare,
  Wifi,
} from "lucide-react";

export default function IncidentQueue() {
  const { toast } = useToast();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("1");
  
  const properties = [
    { id: "1", name: "The Table Bay Hotel", location: "Cape Town, Western Cape" },
    { id: "2", name: "Umhlanga Sands Resort", location: "Durban, KwaZulu-Natal" },
    { id: "3", name: "Saxon Hotel", location: "Johannesburg, Gauteng" },
  ];

  const navSections = [
    {
      label: "Main",
      items: [
        { title: "Dashboard", href: "/manager", icon: LayoutDashboard },
        { title: "Incident Queue", href: "/manager/incidents", icon: AlertTriangle },
        { title: "Network Status", href: "/manager/network", icon: Wifi },
      ],
    },
    {
      label: "Analysis",
      items: [
        { title: "Analytics", href: "/manager/analytics", icon: BarChart3 },
        { title: "Reports", href: "/manager/reports", icon: FileText },
      ],
    },
    {
      label: "Communication",
      items: [
        { title: "Guest Messages", href: "/manager/messages", icon: MessageSquare },
      ],
    },
  ];

  const { data: allEvents = [] } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  // Filter events by selected property on client side
  const events = allEvents.filter(e => e.propertyId === selectedPropertyId);

  const { data: timeline = [] } = useQuery<EventTimeline[]>({
    queryKey: ["/api/events", selectedEventId, "timeline"],
    enabled: !!selectedEventId,
  });

  const assignEventMutation = useMutation({
    mutationFn: async ({ eventId, assignedTo }: { eventId: string; assignedTo: string }) => {
      const response = await apiRequest("PATCH", `/api/events/${eventId}`, {
        status: "assigned",
        assignedTo,
      });
      const event = await response.json();
      
      await apiRequest("POST", `/api/events/${eventId}/timeline`, {
        action: `Assigned to ${assignedTo}`,
        actor: "Manager Dashboard",
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

  const resolveEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await apiRequest("PATCH", `/api/events/${eventId}`, {
        status: "resolved",
      });
      const event = await response.json();
      
      await apiRequest("POST", `/api/events/${eventId}/timeline`, {
        action: "Event marked as resolved",
        actor: "Manager Dashboard",
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
        actor: "Manager Dashboard",
      });
      
      return event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events", selectedEventId, "timeline"] });
      toast({
        title: "Event Escalated",
        description: "Priority level has been increased",
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

  const convertToEventDetailProps = (event: Event, withTimeline: boolean): EventDetailProps => ({
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
    timeline: withTimeline ? timeline.map(entry => ({
      timestamp: formatTimestamp(entry.timestamp),
      action: entry.action,
      actor: entry.actor,
    })) : [],
  });

  const selectedEvent = selectedEventId 
    ? events.find(e => e.id === selectedEventId) 
    : null;
  const selectedEventDetails = selectedEvent ? convertToEventDetailProps(selectedEvent, true) : null;

  return (
    <AppLayout
      title="Incident Queue"
      homeRoute="/manager"
      notificationCount={events.filter(e => e.status !== 'resolved').length}
      navSections={navSections}
      sidebarHeader={
        <PropertySelector
          properties={properties}
          onPropertyChange={setSelectedPropertyId}
        />
      }
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1">Incident Management</h2>
          <p className="text-muted-foreground">Monitor and manage all incidents across the property</p>
        </div>

        <EventQueue
          events={events.map(e => convertToEventDetailProps(e, false))}
          onEventClick={(eventId) => setSelectedEventId(eventId)}
        />
      </div>

      <EventDetailPanel
        event={selectedEventDetails}
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
