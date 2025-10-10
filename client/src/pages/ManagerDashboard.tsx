import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { PropertyList } from "@/components/PropertyList";
import { KPIWidget } from "@/components/KPIWidget";
import { EventQueue } from "@/components/EventQueue";
import { EventDetailPanel, type EventDetailProps } from "@/components/EventDetailPanel";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PROPERTIES } from "@/lib/properties";
import type { Event, EventTimeline } from "@shared/schema";
import {
  LayoutDashboard,
  AlertTriangle,
  Users,
  DollarSign,
  Clock,
  BarChart3,
  FileText,
  MessageSquare,
  Wifi,
} from "lucide-react";

export default function ManagerDashboard() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  // Use the first 3 properties for the manager's scope
  const managerProperties = PROPERTIES.slice(0, 3);
  const managerPropertyIds = managerProperties.map(p => p.id);

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

  // Fetch all events
  const { data: allEvents = [] } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  // Filter events for manager's properties
  const events = allEvents.filter(e => managerPropertyIds.includes(e.propertyId || ''));

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
      
      // Add timeline entry
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
    onError: (error: any) => {
      toast({
        title: "Assignment Failed",
        description: error.message || "Failed to assign event",
        variant: "destructive",
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
      
      // Add timeline entry
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
    onError: (error: any) => {
      toast({
        title: "Resolution Failed",
        description: error.message || "Failed to resolve event",
        variant: "destructive",
      });
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
      
      // Add timeline entry
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
        description: "Priority has been increased",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Escalation Failed",
        description: error.message || "Failed to escalate event",
        variant: "destructive",
      });
    },
  });

  // Convert Event + Timeline to EventDetailProps
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const convertToEventDetailProps = (event: Event, withTimeline: boolean = false): EventDetailProps => ({
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

  // Calculate KPIs from actual events
  const activeIncidents = events.filter(e => e.status !== 'resolved').length;
  const totalAffectedGuests = events.filter(e => e.status !== 'resolved').reduce((sum, e) => sum + (e.affectedGuests || 0), 0);
  const criticalEvents = events.filter(e => e.priority === 'critical' && e.status !== 'resolved').length;

  // Calculate property incident counts and statuses (for all manager properties)
  const propertyIncidentCounts = managerProperties.reduce((acc, prop) => {
    const propertyEvents = allEvents.filter(e => e.propertyId === prop.id && e.status !== 'resolved');
    acc[prop.id] = propertyEvents.length;
    return acc;
  }, {} as Record<string, number>);

  const getPropertyStatus = (propertyId: string): "healthy" | "degraded" | "critical" | "offline" => {
    const propertyEvents = allEvents.filter(e => e.propertyId === propertyId && e.status !== 'resolved');
    const hasCritical = propertyEvents.some(e => e.priority === 'critical');
    const activeCount = propertyEvents.length;

    if (hasCritical) return "critical";
    if (activeCount > 3) return "degraded";
    if (activeCount > 0) return "degraded";
    return "healthy";
  };

  const propertyCards = managerProperties.map(prop => ({
    id: prop.id,
    name: prop.name,
    location: prop.location,
    status: getPropertyStatus(prop.id),
    incidentCount: propertyIncidentCounts[prop.id] || 0,
  }));

  return (
    <AppLayout
      title="Property Management Dashboard"
      homeRoute="/manager"
      notificationCount={activeIncidents}
      navSections={navSections}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-1">Performance Overview</h2>
          <p className="text-muted-foreground">Monitor incidents and operational metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPIWidget
            title="Active Incidents"
            value={activeIncidents}
            change={0}
            trend="down"
            icon={AlertTriangle}
          />
          <KPIWidget
            title="Affected Guests"
            value={totalAffectedGuests}
            change={0}
            trend="down"
            icon={Users}
          />
          <KPIWidget
            title="Critical Events"
            value={criticalEvents}
            change={0}
            trend={criticalEvents > 0 ? "up" : "down"}
            icon={DollarSign}
          />
          <KPIWidget
            title="Total Events"
            value={events.length}
            change={0}
            trend="down"
            icon={Clock}
          />
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Property Status</h3>
          <PropertyList
            properties={propertyCards}
            onPropertyClick={(property) => setLocation(`/manager/properties/${property.id}`)}
          />
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Incident Queue</h3>
          <EventQueue
            events={events.map(e => convertToEventDetailProps(e, false))}
            onEventClick={(eventId) => setSelectedEventId(eventId)}
          />
        </div>
      </div>

      <EventDetailPanel
        event={selectedEventDetails}
        open={!!selectedEventId}
        onClose={() => setSelectedEventId(null)}
        onAssign={(id) => {
          assignEventMutation.mutate({
            eventId: id,
            assignedTo: "John Smith", // In real app, show technician selector
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
