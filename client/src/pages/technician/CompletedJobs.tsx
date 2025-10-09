import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { PropertySelector } from "@/components/PropertySelector";
import { EventQueue } from "@/components/EventQueue";
import type { Event } from "@shared/schema";
import { ClipboardList, History, Calendar, Wrench } from "lucide-react";

export default function CompletedJobs() {
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

  const { data: allEvents = [] } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const completedWork = allEvents.filter(e => e.status === 'resolved');

  const formatTimestamp = (date: Date | null | undefined) => {
    if (!date) return "N/A";
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const convertToEventProps = (event: Event) => ({
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
    timeline: [],
  });

  return (
    <AppLayout
      title="Completed Jobs"
      homeRoute="/technician"
      navSections={navSections}
      sidebarHeader={
        <PropertySelector
          properties={properties}
          onPropertyChange={(id) => console.log("Property changed to:", id)}
        />
      }
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1">Completed Jobs</h2>
          <p className="text-muted-foreground">Review your completed work history</p>
        </div>

        <EventQueue
          events={completedWork.map(e => convertToEventProps(e))}
          onEventClick={(eventId) => console.log("Event clicked:", eventId)}
        />
      </div>
    </AppLayout>
  );
}
