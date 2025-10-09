import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PropertySelector } from "@/components/PropertySelector";
import { EventCard } from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Camera, CheckCircle2, ClipboardList, History, Calendar, Wrench } from "lucide-react";

export default function TechnicianApp() {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  const properties = [
    { id: "1", name: "Grand Hotel Downtown", location: "New York, NY" },
    { id: "2", name: "Beachside Resort", location: "Miami, FL" },
    { id: "3", name: "Mountain Lodge", location: "Denver, CO" },
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

  const workQueue = [
    {
      id: "evt-001",
      title: "Wi-Fi Not Working - Room 305",
      description: "Guest reported complete loss of connectivity in room 305.",
      priority: "critical" as const,
      status: "assigned" as const,
      location: "Room 305, Building A",
      timestamp: "2m ago",
    },
    {
      id: "evt-002",
      title: "Slow Internet - Conference Hall A",
      description: "Multiple guests experiencing degraded performance.",
      priority: "high" as const,
      status: "assigned" as const,
      location: "Conference Hall A, Main Building",
      timestamp: "15m ago",
    },
  ];

  const completedWork = [
    {
      id: "evt-100",
      title: "Device Limit Issue - Room 412",
      description: "Resolved guest device connection limit issue.",
      priority: "medium" as const,
      status: "resolved" as const,
      location: "Room 412",
      timestamp: "2h ago",
    },
  ];

  return (
    <AppLayout
      title="Technician App"
      homeRoute="/technician"
      notificationCount={2}
      navSections={navSections}
      sidebarHeader={
        <PropertySelector
          properties={properties}
          onPropertyChange={(id) => console.log("Property changed:", id)}
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
              Completed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="queue" className="mt-6 space-y-4">
            {workQueue.map((event) => (
              <div key={event.id}>
                <EventCard
                  {...event}
                  onView={() => setSelectedEvent(event.id)}
                />
                {selectedEvent === event.id && (
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle>Incident Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
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
                        onClick={() => {
                          console.log("Mark as resolved");
                          setSelectedEvent(null);
                        }}
                        data-testid="button-resolve"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Mark as Resolved
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="completed" className="mt-6 space-y-4">
            {completedWork.map((event) => (
              <EventCard key={event.id} {...event} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
