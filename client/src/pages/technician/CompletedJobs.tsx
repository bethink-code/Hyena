import { useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { PropertyList } from "@/components/PropertyList";
import { PROPERTIES } from "@/lib/properties";
import type { Incident } from "@shared/schema";
import { ClipboardList, History, Calendar, Wrench } from "lucide-react";

export default function CompletedJobs() {
  const [, setLocation] = useLocation();
  
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

  const { data: allEvents = [] } = useQuery<Incident[]>({
    queryKey: ["/api/events"],
  });

  // Calculate completed job metrics for each property
  const propertiesWithCompletedJobs = useMemo(() => {
    return PROPERTIES.map(property => {
      // Get all completed jobs for this property
      const completedJobs = allEvents.filter(
        e => e.propertyId === property.id && e.status === 'resolved'
      );

      // Calculate jobs completed this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const completedThisWeek = completedJobs.filter(job => {
        if (!job.updatedAt) return false;
        return new Date(job.updatedAt) >= oneWeekAgo;
      }).length;

      const totalCompleted = completedJobs.length;

      // Calculate all jobs (completed + pending) for completion rate
      const allPropertyJobs = allEvents.filter(e => e.propertyId === property.id);
      const completionRate = allPropertyJobs.length > 0
        ? Math.round((totalCompleted / allPropertyJobs.length) * 100)
        : 0;

      // Determine status based on completion metrics
      let status: "healthy" | "degraded" | "critical" | "offline" = "healthy";
      if (completionRate >= 90) {
        status = "healthy";
      } else if (completionRate >= 70) {
        status = "degraded";
      } else {
        status = "critical";
      }

      return {
        ...property,
        status,
        incidentCount: totalCompleted,
        criticalCount: completedThisWeek,
        newCount: completionRate,
      };
    });
  }, [allEvents]);

  return (
    <AppLayout
      title="Completed Jobs"
      homeRoute="/technician"
      navSections={navSections}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-1">Completed Jobs by Property</h2>
          <p className="text-muted-foreground">Review completed work history across all properties</p>
        </div>

        <PropertyList
          properties={propertiesWithCompletedJobs}
          onPropertyClick={(property) => {
            if (property.id) {
              setLocation(`/technician/properties/${property.id}`);
            }
          }}
        />
      </div>
    </AppLayout>
  );
}
