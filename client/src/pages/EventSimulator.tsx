import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { IncidentQueue } from "@/components/IncidentQueue";
import { IncidentDetailPanel } from "@/components/IncidentDetailPanel";
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
import { PROPERTIES } from "@/lib/properties";
import { EVENT_CATEGORY_OPTIONS, EVENT_CATEGORIES } from "@shared/eventCategories";
import type { Incident, InsertIncident, User } from "@shared/schema";
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
  { value: "manager_report", label: "Manager Report" },
  { value: "technician_report", label: "Technician Report" },
  { value: "automated_alert", label: "Automated Alert" },
  { value: "scheduled_check", label: "Scheduled Health Check" },
  { value: "eskom_api", label: "Eskom Load Shedding API" },
  { value: "weather_api", label: "Weather Alert API" },
];

const PRESET_SCENARIOS = [
  {
    name: "Complete System Test - All Categories",
    events: [
      {
        title: "Network Outage - Reception Area",
        description: "Complete network failure in reception and lobby area. Guests unable to check in or access services.",
        priority: "critical",
        status: "new",
        category: EVENT_CATEGORIES.NETWORK_CONNECTIVITY,
        itemType: "incident", // Active failure requiring technician action
        affectedGuests: 50,
        estimatedResolution: "1 hour",
        source: "api_monitoring",
        propertyId: "1",
        eventType: "reactive",
      },
      {
        title: "Slow Wi-Fi Performance - Building B",
        description: "Guests reporting significantly degraded network speeds in Building B rooms 200-250.",
        priority: "high",
        status: "new",
        category: EVENT_CATEGORIES.PERFORMANCE,
        itemType: "incident", // Actionable guest report
        affectedGuests: 30,
        estimatedResolution: "45 minutes",
        source: "guest_portal",
        propertyId: "2",
        eventType: "reactive",
      },
      {
        title: "Bandwidth Congestion - Conference Hall",
        description: "High bandwidth usage during corporate event causing network slowdown. 200+ devices connected.",
        priority: "medium",
        status: "new",
        category: EVENT_CATEGORIES.BANDWIDTH,
        itemType: "incident", // Performance issue requiring action (capacity adjustment)
        affectedGuests: 200,
        estimatedResolution: "Until event ends",
        source: "automated_alert",
        propertyId: "3",
        eventType: "reactive",
      },
      {
        title: "Core Router Failure - Data Centre",
        description: "Primary router in data centre has failed. Failover to backup router successful but requires replacement.",
        priority: "critical",
        status: "new",
        category: EVENT_CATEGORIES.HARDWARE_FAILURE,
        itemType: "incident", // Hardware failure requiring technician replacement
        affectedGuests: 0,
        estimatedResolution: "4 hours",
        source: "api_monitoring",
        propertyId: "1",
        eventType: "reactive",
      },
      {
        title: "SSID Configuration Error - Pool Area",
        description: "Guest network SSID not broadcasting in pool and outdoor dining areas after recent update.",
        priority: "medium",
        status: "new",
        category: EVENT_CATEGORIES.CONFIGURATION,
        itemType: "incident", // Actionable front desk report
        affectedGuests: 25,
        estimatedResolution: "30 minutes",
        source: "front_desk",
        propertyId: "4",
        eventType: "reactive",
      },
      {
        title: "Security Breach Attempt - Room 815",
        description: "Multiple failed authentication attempts detected from Room 815. Possible unauthorized access attempt.",
        priority: "critical",
        status: "new",
        category: EVENT_CATEGORIES.SECURITY,
        itemType: "incident", // Security breach requiring immediate investigation
        affectedGuests: 1,
        estimatedResolution: "Immediate investigation",
        source: "api_monitoring",
        propertyId: "2",
        eventType: "reactive",
      },
      {
        title: "Guest Login Issues - Mobile App",
        description: "Multiple guests unable to authenticate via mobile app. Desktop portal working normally.",
        priority: "high",
        status: "new",
        category: EVENT_CATEGORIES.AUTHENTICATION,
        itemType: "incident", // Actionable guest report
        affectedGuests: 15,
        estimatedResolution: "1 hour",
        source: "guest_portal",
        propertyId: "1",
        eventType: "reactive",
      },
      {
        title: "Video Conferencing Quality Issues - Business Centre",
        description: "Guests in business centre experiencing poor video quality and dropped calls during virtual meetings.",
        priority: "medium",
        status: "new",
        category: EVENT_CATEGORIES.ADVANCED_SERVICES,
        itemType: "incident", // Actionable front desk report
        affectedGuests: 8,
        estimatedResolution: "2 hours",
        source: "front_desk",
        propertyId: "3",
        eventType: "reactive",
      },
      {
        title: "Stage 6 Load Shedding Alert - Johannesburg",
        description: "Eskom Stage 6 load shedding affecting area. Backup generators online. UPS systems protecting critical infrastructure.",
        priority: "critical",
        status: "new",
        category: EVENT_CATEGORIES.LOAD_SHEDDING,
        itemType: "alert", // Informational from Eskom API
        affectedGuests: 180,
        estimatedResolution: "6 hours",
        source: "eskom_api",
        propertyId: "5",
        eventType: "environmental",
        metadata: JSON.stringify({ loadSheddingStage: "stage_6", area: "Sandton, Johannesburg" }),
      },
      {
        title: "Vodacom Fibre Outage - Durban North",
        description: "Vodacom reporting fibre cut in Durban North area. Switched to MTN backup line. Reduced capacity expected.",
        priority: "high",
        status: "new",
        category: EVENT_CATEGORIES.ISP_OUTAGE,
        itemType: "incident", // Active outage requiring monitoring and communication
        affectedGuests: 120,
        estimatedResolution: "4 hours",
        source: "automated_alert",
        propertyId: "2",
        eventType: "environmental",
        metadata: JSON.stringify({ isp: "Vodacom", backupISP: "MTN" }),
      },
      {
        title: "KZN Flooding - Infrastructure Impact",
        description: "Heavy flooding in KZN affecting underground cabling. Water damage to network equipment in basement.",
        priority: "critical",
        status: "new",
        category: EVENT_CATEGORIES.WEATHER_IMPACT,
        itemType: "incident", // Infrastructure damage requiring repair/replacement
        affectedGuests: 200,
        estimatedResolution: "12 hours",
        source: "weather_api",
        propertyId: "2",
        eventType: "environmental",
        metadata: JSON.stringify({ weatherType: "KZN Flooding" }),
      },
      {
        title: "Guest Complaint - Slow Streaming Services",
        description: "Guest in premium suite complaining about Netflix and streaming quality. Room 1205 VIP guest.",
        priority: "medium",
        status: "new",
        category: EVENT_CATEGORIES.GUEST_EXPERIENCE,
        itemType: "incident", // Actionable front desk report
        affectedGuests: 2,
        estimatedResolution: "30 minutes",
        source: "front_desk",
        propertyId: "1",
        eventType: "reactive",
      },
      {
        title: "Scheduled Switch Maintenance - Weekend Upgrade",
        description: "Planned upgrade of network switches in Buildings C and D. Service window: Saturday 02:00-06:00.",
        priority: "low",
        status: "new",
        category: EVENT_CATEGORIES.PLANNED_MAINTENANCE,
        itemType: "alert", // Informational scheduled event
        affectedGuests: 0,
        estimatedResolution: "4 hours",
        source: "scheduled_check",
        propertyId: "3",
        eventType: "proactive",
        scheduledFor: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Rugby World Cup Weekend - High Traffic Expected",
        description: "Major sporting event this weekend. 400+ guests expected. Bandwidth capacity increased proactively.",
        priority: "medium",
        status: "new",
        category: EVENT_CATEGORIES.HIGH_TRAFFIC_EVENT,
        itemType: "alert", // Proactive capacity planning - informational
        affectedGuests: 400,
        estimatedResolution: "Weekend duration",
        source: "manager_report",
        propertyId: "4",
        eventType: "proactive",
        scheduledFor: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Routine Access Point Inspection - Floor 3",
        description: "Monthly access point health check and cleaning for Floor 3. All APs functioning normally.",
        priority: "low",
        status: "new",
        category: EVENT_CATEGORIES.EQUIPMENT_MAINTENANCE,
        itemType: "alert", // Preventative maintenance - informational
        affectedGuests: 0,
        estimatedResolution: "1 hour",
        source: "technician_report",
        propertyId: "1",
        eventType: "proactive",
      },
    ]
  },
  {
    name: "Critical Wi-Fi Outage",
    events: [{
      title: "Complete Wi-Fi Failure - Entire Property",
      description: "Total network outage affecting all guest rooms and common areas. No devices can connect.",
      priority: "critical",
      status: "new",
      category: EVENT_CATEGORIES.NETWORK_CONNECTIVITY,
      itemType: "incident", // Critical outage requiring immediate technician action
      affectedGuests: 150,
      estimatedResolution: "2 hours",
      source: "api_monitoring",
      propertyId: "1",
      eventType: "reactive",
    }]
  },
  {
    name: "Eskom Load Shedding - Stage 4",
    events: [{
      title: "Stage 4 Load Shedding Alert - Cape Town",
      description: "Eskom has implemented Stage 4 load shedding. Backup generators activated. UPS systems on standby. Expected duration: 4 hours.",
      priority: "critical",
      status: "new",
      category: EVENT_CATEGORIES.LOAD_SHEDDING,
      itemType: "alert", // Informational from Eskom API
      affectedGuests: 200,
      estimatedResolution: "4 hours",
      source: "eskom_api",
      propertyId: "1",
      eventType: "environmental",
      metadata: JSON.stringify({ loadSheddingStage: "stage_4", area: "Cape Town CBD" }),
    }]
  },
  {
    name: "Cape Storm Network Impact",
    events: [{
      title: "Cape Storm - Fibre Line Damaged",
      description: "Severe Cape storm has damaged fibre optic line. Telkom notified. Backup ISP connection active but degraded performance expected.",
      priority: "high",
      status: "new",
      category: EVENT_CATEGORIES.WEATHER_IMPACT,
      itemType: "incident", // Active damage requiring monitoring and coordination
      affectedGuests: 180,
      estimatedResolution: "8-12 hours",
      source: "weather_api",
      propertyId: "1",
      eventType: "environmental",
      metadata: JSON.stringify({ weatherType: "Cape Storm", isp: "Telkom" }),
    }]
  },
  {
    name: "Telkom Fibre Outage (SA)",
    events: [{
      title: "Telkom Fibre Outage - Umhlanga Area",
      description: "Telkom fibre cut reported in Umhlanga area. Multiple properties affected. ETR from Telkom: 6 hours. Failover to Vodacom backup line.",
      priority: "critical",
      status: "new",
      category: EVENT_CATEGORIES.ISP_OUTAGE,
      itemType: "incident", // Active outage requiring monitoring and communication
      affectedGuests: 220,
      estimatedResolution: "6 hours",
      source: "automated_alert",
      propertyId: "2",
      eventType: "environmental",
      metadata: JSON.stringify({ isp: "Telkom", backupISP: "Vodacom" }),
    }]
  },
  {
    name: "Planned Conference - High Traffic",
    events: [{
      title: "Corporate Conference - Bandwidth Upgrade Required",
      description: "300-person tech conference scheduled. Additional bandwidth provisioned. Network capacity monitoring activated.",
      priority: "medium",
      status: "new",
      category: EVENT_CATEGORIES.HIGH_TRAFFIC_EVENT,
      itemType: "alert", // Informational scheduled event
      affectedGuests: 300,
      estimatedResolution: "3 days",
      source: "scheduled_check",
      propertyId: "4",
      eventType: "proactive",
      scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    }]
  },
  {
    name: "Multiple Guest Issues",
    events: [
      {
        title: "Slow Internet - Room 305",
        description: "Guest reports degraded performance, unable to work remotely",
        priority: "medium",
        status: "new",
        category: EVENT_CATEGORIES.PERFORMANCE,
        itemType: "incident", // Actionable guest report
        affectedGuests: 1,
        estimatedResolution: "20 minutes",
        source: "guest_portal",
        propertyId: "3",
        eventType: "reactive",
      },
      {
        title: "Cannot Connect - Room 412",
        description: "Guest unable to find network SSID",
        priority: "medium",
        status: "new",
        category: EVENT_CATEGORIES.CONFIGURATION,
        itemType: "incident", // Actionable guest report
        affectedGuests: 1,
        estimatedResolution: "15 minutes",
        source: "guest_portal",
        propertyId: "3",
        eventType: "reactive",
      },
    ]
  },
  {
    name: "Security Alert",
    events: [{
      title: "Unauthorised Access Attempt Detected",
      description: "Multiple failed authentication attempts from Room 215. Potential security breach.",
      priority: "critical",
      status: "new",
      category: EVENT_CATEGORIES.SECURITY,
      itemType: "incident", // Security breach requiring immediate investigation
      affectedGuests: 1,
      estimatedResolution: "Immediate",
      source: "api_monitoring",
      propertyId: "1",
      eventType: "reactive",
    }]
  },
  {
    name: "Scheduled Maintenance - Router Upgrade",
    events: [{
      title: "Planned Router Firmware Upgrade - Building A",
      description: "Scheduled firmware upgrade for core routers in Building A. Brief service interruption expected during upgrade window (02:00-04:00).",
      priority: "low",
      status: "new",
      category: EVENT_CATEGORIES.PLANNED_MAINTENANCE,
      itemType: "alert", // Informational scheduled event
      affectedGuests: 0,
      estimatedResolution: "2 hours",
      source: "scheduled_check",
      propertyId: "5",
      eventType: "proactive",
      scheduledFor: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }]
  },
];

export default function EventSimulator() {
  const { toast } = useToast();
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "new",
    location: "",
    category: "",
    itemType: "incident" as "alert" | "incident", // Alert vs Incident
    affectedGuests: 1,
    estimatedResolution: "",
    source: "manual_report",
    rootCause: "",
    propertyId: "1", // Default to first property
    assignedTo: "", // Optional technician assignment
  });

  // Fetch all incidents
  const { data: incidents = [], isLoading } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
  });

  // Fetch all users and filter to technicians
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const technicians = users.filter(user => user.role === "technician");

  // Create incident mutation
  const createIncidentMutation = useMutation({
    mutationFn: async (incidentData: Omit<InsertIncident, 'createdAt' | 'updatedAt'>) => {
      const response = await apiRequest("POST", "/api/incidents", incidentData);
      return await response.json();
    },
    onSuccess: (incident: Incident) => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      toast({
        title: "Incident Created",
        description: `${incident.title} (${incident.id})`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create incident",
        variant: "destructive",
      });
    },
  });

  // Delete all incidents (for clearing)
  const clearIncidentsMutation = useMutation({
    mutationFn: async () => {
      // Delete all incidents one by one
      const deletePromises = incidents.map(incident =>
        apiRequest("DELETE", `/api/incidents/${incident.id}`)
      );
      await Promise.all(deletePromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      toast({
        title: "Incidents Cleared",
        description: "All simulated incidents have been removed",
      });
    },
  });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare incident data, excluding assignedTo if empty
    const incidentData = {
      ...formData,
      assignedTo: formData.assignedTo || undefined, // Exclude if empty
    };
    
    createIncidentMutation.mutate(incidentData as any);

    // Reset form
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      status: "new",
      location: "",
      category: "",
      itemType: "incident",
      affectedGuests: 1,
      estimatedResolution: "",
      source: "manual_report",
      rootCause: "",
      propertyId: "1", // Keep default property
      assignedTo: "", // Reset technician assignment
    });
  };

  const handlePresetScenario = async (scenario: typeof PRESET_SCENARIOS[0]) => {
    // Create all incidents in the scenario
    for (const incident of scenario.events) {
      await createIncidentMutation.mutateAsync(incident as any);
    }
    
    toast({
      title: "Scenario Loaded",
      description: `Created ${scenario.events.length} incident(s) for "${scenario.name}"`,
    });
  };

  const clearAllIncidents = () => {
    clearIncidentsMutation.mutate();
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
      title="Incident Simulator"
      homeRoute="/simulator"
      showSidebar={false}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Zap className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Incident Simulator</h1>
          </div>
          <p className="text-muted-foreground">
            Create and manage simulated network events for testing and demonstration purposes.
            Events created here will flow through the entire system.
          </p>
        </div>

        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manual" data-testid="tab-manual">
              Manual Incident
            </TabsTrigger>
            <TabsTrigger value="presets" data-testid="tab-presets">
              Preset Scenarios
            </TabsTrigger>
            <TabsTrigger value="events" data-testid="tab-events">
              Simulated Incidents ({incidents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Custom Incident</CardTitle>
                <CardDescription>
                  Manually define all incident properties for precise testing scenarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleManualSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Incident Title *</Label>
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
                      <Label htmlFor="source">Incident Source *</Label>
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
                      <Label htmlFor="itemType">Type *</Label>
                      <Select
                        value={formData.itemType}
                        onValueChange={(value: "alert" | "incident") => setFormData({ ...formData, itemType: value })}
                      >
                        <SelectTrigger id="itemType" data-testid="select-item-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="incident">Incident (Actionable work)</SelectItem>
                          <SelectItem value="alert">Alert (Informational)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="assignedTo">Assign to Technician (Optional)</Label>
                      <Select
                        value={formData.assignedTo || undefined}
                        onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
                      >
                        <SelectTrigger id="assignedTo" data-testid="select-assigned-to">
                          <SelectValue placeholder="Select a technician" />
                        </SelectTrigger>
                        <SelectContent>
                          {technicians.map((tech) => (
                            <SelectItem key={tech.id} value={tech.name}>
                              {tech.name}
                            </SelectItem>
                          ))}
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
                          {EVENT_CATEGORY_OPTIONS.map((cat) => (
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
                    disabled={createIncidentMutation.isPending}
                  >
                    {createIncidentMutation.isPending ? (
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
                            {scenario.events.length} incident{scenario.events.length > 1 ? 's' : ''}
                          </CardDescription>
                        </div>
                        <Button
                          onClick={() => handlePresetScenario(scenario)}
                          data-testid={`button-preset-${index}`}
                          disabled={createIncidentMutation.isPending}
                        >
                          {createIncidentMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Wand2 className="h-4 w-4 mr-2" />
                          )}
                          Load Scenario
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {scenario.events.map((incident, incidentIndex) => (
                        <div key={incidentIndex} className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="capitalize">
                            {incident.priority}
                          </Badge>
                          <span className="text-muted-foreground">{incident.title}</span>
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
                <h3 className="text-lg font-semibold">Simulated Incidents</h3>
                <p className="text-sm text-muted-foreground">
                  All incidents in the system
                </p>
              </div>
              {incidents.length > 0 && (
                <Button
                  variant="outline"
                  onClick={clearAllIncidents}
                  data-testid="button-clear-all"
                  disabled={clearIncidentsMutation.isPending}
                >
                  {clearIncidentsMutation.isPending ? (
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
                    <p className="text-muted-foreground">Loading incidents...</p>
                  </div>
                </CardContent>
              </Card>
            ) : incidents.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No incidents created yet. Use the Manual Incident or Preset Scenarios tabs to create incidents.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <IncidentQueue 
                incidents={incidents.map(incident => ({
                  id: incident.id,
                  title: incident.title,
                  description: incident.description,
                  priority: incident.priority as any,
                  status: incident.status as any,
                  location: incident.location || undefined,
                  assignedTo: incident.assignedTo || undefined,
                  timestamp: formatTimestamp(incident.createdAt),
                }))}
                onIncidentClick={(incidentId) => setSelectedIncidentId(incidentId)}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      <IncidentDetailPanel
        incident={selectedIncidentId ? (() => {
          const incident = incidents.find(e => e.id === selectedIncidentId);
          if (!incident) return null;
          
          return {
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
            timeline: [],
          };
        })() : null}
        open={selectedIncidentId !== null}
        onClose={() => setSelectedIncidentId(null)}
      />
    </AppLayout>
  );
}
