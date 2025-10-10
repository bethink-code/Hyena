import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { PropertySelector } from "@/components/PropertySelector";
import { EventQueue } from "@/components/EventQueue";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Event } from "@shared/schema";
import { MapPin, Camera, CheckCircle2, ClipboardList, History, Calendar, Wrench, Play } from "lucide-react";

export default function TechnicianApp() {
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("1");

  const properties = [
    { id: "1", name: "The Table Bay Hotel", location: "Cape Town, Western Cape" },
    { id: "2", name: "Umhlanga Sands Resort", location: "Durban, KwaZulu-Natal" },
    { id: "3", name: "Saxon Hotel", location: "Johannesburg, Gauteng" },
  ];

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

  // Filter events by selected property on client side
  const propertyEvents = allEvents.filter(e => e.propertyId === selectedPropertyId);

  // Filter events for work queue (assigned or in_progress)
  const workQueue = propertyEvents.filter(e => 
    e.status === 'assigned' || e.status === 'in_progress'
  );

  // Filter events for completed work
  const completedWork = propertyEvents.filter(e => e.status === 'resolved');

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
      sidebarHeader={
        <PropertySelector
          properties={properties}
          onPropertyChange={setSelectedPropertyId}
        />
      }
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
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
            <EventQueue 
              events={convertToEventProps(workQueue)}
              onEventClick={(eventId) => setSelectedEvent(eventId)}
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
              events={convertToEventProps(completedWork)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
