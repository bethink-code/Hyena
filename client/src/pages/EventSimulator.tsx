import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Zap,
  Plus,
  Trash2,
  RefreshCw,
  Database,
  Wand2,
} from "lucide-react";
import type { EventDetailProps } from "@/components/EventDetailPanel";

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

const PRESET_SCENARIOS = [
  {
    name: "Critical Wi-Fi Outage",
    events: [{
      title: "Complete Wi-Fi Failure - Entire Property",
      description: "Total network outage affecting all guest rooms and common areas. No devices can connect.",
      priority: "critical" as const,
      status: "new" as const,
      category: "Network Connectivity",
      affectedGuests: 150,
      estimatedResolution: "2 hours",
      source: "api_monitoring",
    }]
  },
  {
    name: "High Traffic Conference",
    events: [
      {
        title: "Bandwidth Congestion - Conference Hall A",
        description: "100+ devices connected for corporate event causing network slowdown",
        priority: "high" as const,
        status: "new" as const,
        category: "Performance",
        affectedGuests: 85,
        estimatedResolution: "45 minutes",
        source: "automated_alert",
      },
      {
        title: "Streaming Issues - Conference AV System",
        description: "Video conferencing experiencing packet loss and jitter",
        priority: "high" as const,
        status: "new" as const,
        category: "Advanced Services",
        affectedGuests: 85,
        estimatedResolution: "30 minutes",
        source: "manual_report",
      }
    ]
  },
  {
    name: "Multiple Guest Issues",
    events: [
      {
        title: "Slow Internet - Room 305",
        description: "Guest reports degraded performance, unable to work remotely",
        priority: "medium" as const,
        status: "new" as const,
        category: "Performance",
        affectedGuests: 1,
        estimatedResolution: "20 minutes",
        source: "guest_portal",
      },
      {
        title: "Cannot Connect - Room 412",
        description: "Guest unable to find network SSID",
        priority: "medium" as const,
        status: "new" as const,
        category: "Configuration",
        affectedGuests: 1,
        estimatedResolution: "15 minutes",
        source: "guest_portal",
      },
      {
        title: "Device Limit Reached - Room 508",
        description: "Guest attempting to connect 5th device",
        priority: "low" as const,
        status: "new" as const,
        category: "Configuration",
        affectedGuests: 1,
        estimatedResolution: "10 minutes",
        source: "guest_portal",
      }
    ]
  },
  {
    name: "Security Alert",
    events: [{
      title: "Unauthorized Access Attempt Detected",
      description: "Multiple failed authentication attempts from Room 215. Potential security breach.",
      priority: "critical" as const,
      status: "new" as const,
      category: "Security",
      affectedGuests: 1,
      estimatedResolution: "Immediate",
      source: "api_monitoring",
    }]
  },
];

export default function EventSimulator() {
  const { toast } = useToast();
  const [simulatedEvents, setSimulatedEvents] = useState<EventDetailProps[]>([]);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    status: "new" as const,
    location: "",
    category: "",
    affectedGuests: 1,
    estimatedResolution: "",
    source: "manual_report",
    rootCause: "",
  });

  const generateEventId = () => {
    return `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const createEvent = (eventData: Partial<EventDetailProps> & { source?: string }) => {
    const newEvent: EventDetailProps = {
      id: generateEventId(),
      title: eventData.title || "Untitled Event",
      description: eventData.description || "",
      priority: eventData.priority || "medium",
      status: eventData.status || "new",
      location: eventData.location,
      category: eventData.category,
      affectedGuests: eventData.affectedGuests,
      estimatedResolution: eventData.estimatedResolution,
      rootCause: eventData.rootCause,
      timestamp: "Just now",
      timeline: [
        {
          timestamp: "Just now",
          action: `Event created from ${EVENT_SOURCES.find(s => s.value === eventData.source)?.label || 'Unknown Source'}`,
          actor: "Event Simulator",
        }
      ],
    };

    setSimulatedEvents(prev => [newEvent, ...prev]);
    return newEvent;
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const event = createEvent(formData);
    
    toast({
      title: "Event Created",
      description: `${event.title} (${event.id})`,
    });

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
    });
  };

  const handlePresetScenario = (scenario: typeof PRESET_SCENARIOS[0]) => {
    const createdEvents = scenario.events.map(event => createEvent(event));
    
    toast({
      title: "Scenario Loaded",
      description: `Created ${createdEvents.length} event(s) for "${scenario.name}"`,
    });
  };

  const clearAllEvents = () => {
    setSimulatedEvents([]);
    toast({
      title: "Events Cleared",
      description: "All simulated events have been removed",
    });
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
              Simulated Events ({simulatedEvents.length})
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

                  <Button type="submit" className="w-full" data-testid="button-create-event">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
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
                        >
                          <Wand2 className="h-4 w-4 mr-2" />
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
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Simulated Events</CardTitle>
                    <CardDescription>
                      All events created during this session
                    </CardDescription>
                  </div>
                  {simulatedEvents.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={clearAllEvents}
                      data-testid="button-clear-all"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {simulatedEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No events created yet. Use the Manual Event or Preset Scenarios tabs to create events.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {simulatedEvents.map((event) => (
                      <Card key={event.id} className="hover-elevate">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="capitalize">
                                  {event.priority}
                                </Badge>
                                <Badge variant="outline" className="capitalize">
                                  {event.status.replace('_', ' ')}
                                </Badge>
                                {event.category && (
                                  <Badge variant="outline">{event.category}</Badge>
                                )}
                              </div>
                              <h3 className="font-semibold">{event.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {event.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>ID: {event.id}</span>
                                {event.location && <span>Location: {event.location}</span>}
                                {event.affectedGuests !== undefined && (
                                  <span>Affected: {event.affectedGuests} guest{event.affectedGuests !== 1 ? 's' : ''}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
