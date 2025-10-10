import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { EventQueue } from "@/components/EventQueue";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Event, InsertEvent } from "@shared/schema";
import {
  Zap,
  Plus,
  Trash2,
  Database,
  Wand2,
  Loader2,
} from "lucide-react";

const EVENT_SOURCES = [
  { value: "guest_portal", label: "Guest Portal" },
  { value: "api_monitoring", label: "API Monitoring System" },
  { value: "manual_report", label: "Manual Report" },
  { value: "front_desk", label: "Front Desk" },
  { value: "automated_alert", label: "Automated Alert" },
  { value: "scheduled_check", label: "Scheduled Health Check" },
];

const EVENT_CATEGORIES = [
  "Network Connectivity",
  "Performance",
  "Configuration",
  "Advanced Services",
  "Hardware Failure",
  "Security",
  "Bandwidth",
  "Authentication",
];

const PROPERTIES = [
  { id: "1", name: "The Table Bay Hotel", location: "Cape Town, Western Cape" },
  { id: "2", name: "Umhlanga Sands Resort", location: "Durban, KwaZulu-Natal" },
  { id: "3", name: "Saxon Hotel", location: "Johannesburg, Gauteng" },
];

const PRESET_SCENARIOS = [
  {
    name: "Critical Wi-Fi Outage",
    events: [{
      title: "Complete Wi-Fi Failure - Entire Property",
      description: "Total network outage affecting all guest rooms and common areas. No devices can connect.",
      priority: "critical",
      status: "new",
      category: "Network Connectivity",
      affectedGuests: 150,
      estimatedResolution: "2 hours",
      source: "api_monitoring",
      propertyId: "1", // Table Bay Hotel
    }]
  },
  {
    name: "High Traffic Conference",
    events: [
      {
        title: "Bandwidth Congestion - Conference Hall A",
        description: "100+ devices connected for corporate event causing network slowdown",
        priority: "high",
        status: "new",
        category: "Performance",
        affectedGuests: 85,
        estimatedResolution: "45 minutes",
        source: "automated_alert",
        propertyId: "2", // Umhlanga Sands Resort
      },
      {
        title: "Streaming Issues - Conference AV System",
        description: "Video conferencing experiencing packet loss and jitter",
        priority: "high",
        status: "new",
        category: "Advanced Services",
        affectedGuests: 85,
        estimatedResolution: "30 minutes",
        source: "manual_report",
        propertyId: "2", // Umhlanga Sands Resort
      }
    ]
  },
  {
    name: "Multiple Guest Issues",
    events: [
      {
        title: "Slow Internet - Room 305",
        description: "Guest reports degraded performance, unable to work remotely",
        priority: "medium",
        status: "new",
        category: "Performance",
        affectedGuests: 1,
        estimatedResolution: "20 minutes",
        source: "guest_portal",
        propertyId: "3", // Saxon Hotel
      },
      {
        title: "Cannot Connect - Room 412",
        description: "Guest unable to find network SSID",
        priority: "medium",
        status: "new",
        category: "Configuration",
        affectedGuests: 1,
        estimatedResolution: "15 minutes",
        source: "guest_portal",
        propertyId: "3", // Saxon Hotel
      },
      {
        title: "Device Limit Reached - Room 508",
        description: "Guest attempting to connect 5th device",
        priority: "low",
        status: "new",
        category: "Configuration",
        affectedGuests: 1,
        estimatedResolution: "10 minutes",
        source: "guest_portal",
        propertyId: "3", // Saxon Hotel
      }
    ]
  },
  {
    name: "Security Alert",
    events: [{
      title: "Unauthorized Access Attempt Detected",
      description: "Multiple failed authentication attempts from Room 215. Potential security breach.",
      priority: "critical",
      status: "new",
      category: "Security",
      affectedGuests: 1,
      estimatedResolution: "Immediate",
      source: "api_monitoring",
      propertyId: "1", // Table Bay Hotel
    }]
  },
];

export default function EventSimulator() {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "new",
    location: "",
    category: "",
    affectedGuests: 1,
    estimatedResolution: "",
    source: "manual_report",
    rootCause: "",
    propertyId: "1", // Default to first property
  });

  // Fetch all events
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: Omit<InsertEvent, 'createdAt' | 'updatedAt'>) => {
      const response = await apiRequest("POST", "/api/events", eventData);
      return await response.json();
    },
    onSuccess: (event: Event) => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Event Created",
        description: `${event.title} (${event.id})`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
    },
  });

  // Delete all events (for clearing)
  const clearEventsMutation = useMutation({
    mutationFn: async () => {
      // Delete all events one by one
      const deletePromises = events.map(event =>
        apiRequest("DELETE", `/api/events/${event.id}`)
      );
      await Promise.all(deletePromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Events Cleared",
        description: "All simulated events have been removed",
      });
    },
  });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createEventMutation.mutate(formData as any);

    // Reset form
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      status: "new",
      location: "",
      category: "",
      affectedGuests: 1,
      estimatedResolution: "",
      source: "manual_report",
      rootCause: "",
      propertyId: "1", // Keep default property
    });
  };

  const handlePresetScenario = async (scenario: typeof PRESET_SCENARIOS[0]) => {
    // Create all events in the scenario
    for (const event of scenario.events) {
      await createEventMutation.mutateAsync(event as any);
    }
    
    toast({
      title: "Scenario Loaded",
      description: `Created ${scenario.events.length} event(s) for "${scenario.name}"`,
    });
  };

  const clearAllEvents = () => {
    clearEventsMutation.mutate();
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <AppLayout
      title="Event Simulator"
      homeRoute="/simulator"
      showSidebar={false}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Zap className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Event Simulator</h1>
          </div>
          <p className="text-muted-foreground">
            Create and manage simulated network events for testing and demonstration purposes.
            Events created here will flow through the entire system.
          </p>
        </div>

        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manual" data-testid="tab-manual">
              Manual Event
            </TabsTrigger>
            <TabsTrigger value="presets" data-testid="tab-presets">
              Preset Scenarios
            </TabsTrigger>
            <TabsTrigger value="events" data-testid="tab-events">
              Simulated Events ({events.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Custom Event</CardTitle>
                <CardDescription>
                  Manually define all event properties for precise testing scenarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleManualSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Event Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Wi-Fi Not Working - Room 305"
                        required
                        data-testid="input-title"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="source">Event Source *</Label>
                      <Select
                        value={formData.source}
                        onValueChange={(value) => setFormData({ ...formData, source: value })}
                      >
                        <SelectTrigger id="source" data-testid="select-source">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EVENT_SOURCES.map(source => (
                            <SelectItem key={source.value} value={source.value}>
                              {source.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="property">Property *</Label>
                      <Select
                        value={formData.propertyId}
                        onValueChange={(value) => setFormData({ ...formData, propertyId: value })}
                      >
                        <SelectTrigger id="property" data-testid="select-property">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PROPERTIES.map(property => (
                            <SelectItem key={property.id} value={property.id}>
                              {property.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Detailed description of the issue..."
                        rows={3}
                        required
                        data-testid="input-description"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority *</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                      >
                        <SelectTrigger id="priority" data-testid="select-priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status *</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger id="status" data-testid="select-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="assigned">Assigned</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g., Room 305, Conference Hall A"
                        data-testid="input-location"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger id="category" data-testid="select-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {EVENT_CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="affectedGuests">Affected Guests</Label>
                      <Input
                        id="affectedGuests"
                        type="number"
                        min="0"
                        value={formData.affectedGuests}
                        onChange={(e) => setFormData({ ...formData, affectedGuests: parseInt(e.target.value) || 0 })}
                        data-testid="input-affected-guests"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estimatedResolution">Estimated Resolution</Label>
                      <Input
                        id="estimatedResolution"
                        value={formData.estimatedResolution}
                        onChange={(e) => setFormData({ ...formData, estimatedResolution: e.target.value })}
                        placeholder="e.g., 30 minutes, 2 hours"
                        data-testid="input-estimated-resolution"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="rootCause">Root Cause (Optional)</Label>
                      <Textarea
                        id="rootCause"
                        value={formData.rootCause}
                        onChange={(e) => setFormData({ ...formData, rootCause: e.target.value })}
                        placeholder="Technical analysis of the root cause..."
                        rows={2}
                        data-testid="input-root-cause"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    data-testid="button-create-event"
                    disabled={createEventMutation.isPending}
                  >
                    {createEventMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Event
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="presets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Preset Scenarios</CardTitle>
                <CardDescription>
                  Quickly load common testing scenarios with pre-configured events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {PRESET_SCENARIOS.map((scenario, index) => (
                  <Card key={index} className="hover-elevate">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{scenario.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {scenario.events.length} event{scenario.events.length > 1 ? 's' : ''}
                          </CardDescription>
                        </div>
                        <Button
                          onClick={() => handlePresetScenario(scenario)}
                          data-testid={`button-preset-${index}`}
                          disabled={createEventMutation.isPending}
                        >
                          {createEventMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Wand2 className="h-4 w-4 mr-2" />
                          )}
                          Load Scenario
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {scenario.events.map((event, eventIndex) => (
                        <div key={eventIndex} className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="capitalize">
                            {event.priority}
                          </Badge>
                          <span className="text-muted-foreground">{event.title}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Simulated Events</h3>
                <p className="text-sm text-muted-foreground">
                  All events in the system
                </p>
              </div>
              {events.length > 0 && (
                <Button
                  variant="outline"
                  onClick={clearAllEvents}
                  data-testid="button-clear-all"
                  disabled={clearEventsMutation.isPending}
                >
                  {clearEventsMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Clear All
                </Button>
              )}
            </div>
            
            {isLoading ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Loader2 className="h-12 w-12 mx-auto text-muted-foreground animate-spin mb-4" />
                    <p className="text-muted-foreground">Loading events...</p>
                  </div>
                </CardContent>
              </Card>
            ) : events.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No events created yet. Use the Manual Event or Preset Scenarios tabs to create events.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <EventQueue 
                events={events.map(event => ({
                  id: event.id,
                  title: event.title,
                  description: event.description,
                  priority: event.priority as any,
                  status: event.status as any,
                  location: event.location || undefined,
                  assignedTo: event.assignedTo || undefined,
                  timestamp: formatTimestamp(event.createdAt),
                }))}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
