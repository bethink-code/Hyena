import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { PropertyList } from "@/components/PropertyList";
import { EventQueue } from "@/components/EventQueue";
import { EventDetailPanel } from "@/components/EventDetailPanel";
import { LogIssueDialog } from "@/components/LogIssueDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PROPERTIES } from "@/lib/properties";
import type { Event } from "@shared/schema";
import { MapPin, Camera, CheckCircle2, ClipboardList, History, Calendar, Wrench, Play } from "lucide-react";

export default function TechnicianApp() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [viewingEventId, setViewingEventId] = useState<string | null>(null);

  // Technician works across these three properties
  const technicianProperties = PROPERTIES.filter(p => 
    ["1", "2", "3"].includes(p.id)
  );

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

  // Filter events for technician's properties (1, 2, 3)
  const technicianPropertyIds = ["1", "2", "3"];
  const technicianEvents = allEvents.filter(e => 
    technicianPropertyIds.includes(e.propertyId)
  );

  // Filter events for work queue (assigned or in_progress)
  const workQueue = technicianEvents.filter(e => 
    e.status === 'assigned' || e.status === 'in_progress'
  );

  // Filter events for completed work
  const completedWork = technicianEvents.filter(e => e.status === 'resolved');

  // Start work mutation
  const startWorkMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await apiRequest("PATCH", `/api/events/${eventId}`, {
        status: "in_progress",
      });
      const event = await response.json();
      
      // Add timeline entry
      await apiRequest("POST", `/api/events/${eventId}/timeline`, {
        action: "Technician started working on issue",
        actor: "Technician App",
      });
      
      return event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
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
      
      // Add timeline entry
      await apiRequest("POST", `/api/events/${eventId}/timeline`, {
        action: "Event resolved by technician",
        actor: "Technician App",
      });
      
      return event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Event Resolved",
        description: "Event has been marked as resolved",
      });
      setSelectedEvent(null);
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

  return (
    <AppLayout
      title="Technician App"
      homeRoute="/technician"
      notificationCount={workQueue.length}
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
              const propertyEventCount = allEvents.filter(
                e => e.propertyId === property.id && 
                (e.status === 'new' || e.status === 'assigned' || e.status === 'in_progress')
              ).length;
              
              return {
                ...property,
                incidentCount: propertyEventCount,
              };
            })}
            onPropertyClick={(property) => navigate(`/technician/properties/${property.id}`)}
          />
        </div>

        {/* Work Queue Section */}
        <Tabs defaultValue="queue" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="queue" data-testid="tab-queue">
              Work Queue ({workQueue.length})
            </TabsTrigger>
            <TabsTrigger value="completed" data-testid="tab-completed">
              Completed ({completedWork.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="queue" className="mt-6">
            <div className="flex items-center justify-end mb-4">
              <LogIssueDialog />
            </div>
            <EventQueue 
              key="work-queue"
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
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <EventQueue 
              key="completed-jobs"
              events={convertToEventProps(completedWork)}
              onEventClick={(eventId) => setViewingEventId(eventId)}
            />
          </TabsContent>
        </Tabs>
      </div>

      <EventDetailPanel
        event={viewingEventId ? (() => {
          const event = allEvents.find(e => e.id === viewingEventId);
          if (!event) return null;
          
          return {
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
            timeline: [],
          };
        })() : null}
        open={viewingEventId !== null}
        onClose={() => setViewingEventId(null)}
      />
    </AppLayout>
  );
}
