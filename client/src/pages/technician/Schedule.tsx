import { useMemo } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { PropertyList } from "@/components/PropertyList";
import { PROPERTIES } from "@/lib/properties";
import { ClipboardList, History, Calendar, Wrench } from "lucide-react";

export default function Schedule() {
  const [, setLocation] = useLocation();
  
  // Use the first 3 properties for the technician's scope
  const technicianProperties = PROPERTIES.slice(0, 3);

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

  // Mock maintenance task data for each property
  const maintenanceTasksByProperty: Record<string, Array<{ task: string; date: string; priority: "high" | "medium" | "low"; equipment: string; status: "scheduled" | "overdue" | "completed" }>> = {
    "1": [
      { task: "Router Firmware Update", date: "15/10/2025", priority: "medium", equipment: "Main Router", status: "scheduled" },
      { task: "Access Point Inspection", date: "18/10/2025", priority: "low", equipment: "All APs", status: "scheduled" },
      { task: "Cable Infrastructure Check", date: "22/10/2025", priority: "medium", equipment: "Server Room", status: "scheduled" },
      { task: "Battery Backup Test", date: "25/10/2025", priority: "high", equipment: "UPS Systems", status: "scheduled" },
      { task: "Switch Maintenance", date: "05/10/2025", priority: "medium", equipment: "Main Switch", status: "completed" },
      { task: "Backup System Check", date: "01/10/2025", priority: "low", equipment: "Backup Router", status: "completed" },
    ],
    "2": [
      { task: "Router Firmware Update", date: "08/10/2025", priority: "high", equipment: "Main Router", status: "overdue" },
      { task: "Access Point Inspection", date: "20/10/2025", priority: "low", equipment: "All APs", status: "scheduled" },
      { task: "Cable Infrastructure Check", date: "23/10/2025", priority: "medium", equipment: "Server Room", status: "scheduled" },
      { task: "Battery Backup Test", date: "09/10/2025", priority: "high", equipment: "UPS Systems", status: "overdue" },
      { task: "Switch Maintenance", date: "28/09/2025", priority: "medium", equipment: "Main Switch", status: "completed" },
    ],
    "3": [
      { task: "Router Firmware Update", date: "05/10/2025", priority: "high", equipment: "Main Router", status: "overdue" },
      { task: "Access Point Inspection", date: "06/10/2025", priority: "medium", equipment: "All APs", status: "overdue" },
      { task: "Cable Infrastructure Check", date: "21/10/2025", priority: "medium", equipment: "Server Room", status: "scheduled" },
      { task: "Battery Backup Test", date: "03/10/2025", priority: "high", equipment: "UPS Systems", status: "overdue" },
      { task: "Switch Maintenance", date: "20/09/2025", priority: "low", equipment: "Main Switch", status: "completed" },
    ],
  };

  // Calculate maintenance schedule status for each property
  const propertiesWithScheduleStatus = useMemo(() => {
    return technicianProperties.map(property => {
      const tasks = maintenanceTasksByProperty[property.id] || [];
      
      // Calculate task counts by status
      const scheduledCount = tasks.filter(t => t.status === "scheduled").length;
      const overdueCount = tasks.filter(t => t.status === "overdue").length;
      const completedCount = tasks.filter(t => t.status === "completed").length;
      
      // Determine overall maintenance schedule status
      let scheduleStatus: "healthy" | "degraded" | "critical" | "offline" = "healthy";
      if (overdueCount >= 3) {
        scheduleStatus = "critical";
      } else if (overdueCount >= 2) {
        scheduleStatus = "degraded";
      } else if (overdueCount >= 1) {
        scheduleStatus = "degraded";
      }

      // Use overdue count as incident count and scheduled tasks as new count
      const incidentCount = overdueCount;
      const criticalIncidentCount = tasks.filter(t => t.status === "overdue" && t.priority === "high").length;

      return {
        ...property,
        status: scheduleStatus,
        incidentCount,
        criticalCount: criticalIncidentCount,
        newCount: scheduledCount,
      };
    });
  }, [technicianProperties]);

  return (
    <AppLayout
      title="Preventive Maintenance"
      homeRoute="/technician"
      navSections={navSections}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-1">Maintenance Schedule</h2>
          <p className="text-muted-foreground">Preventive maintenance schedule across all properties</p>
        </div>

        <PropertyList
          properties={propertiesWithScheduleStatus}
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
