import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PropertySelector } from "@/components/PropertySelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, History, Calendar, Wrench } from "lucide-react";

export default function Schedule() {
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

  const maintenanceTasks = [
    { task: "Router Firmware Update", date: "15/10/2025", priority: "medium", equipment: "Main Router" },
    { task: "Access Point Inspection", date: "18/10/2025", priority: "low", equipment: "All APs" },
    { task: "Cable Infrastructure Check", date: "22/10/2025", priority: "medium", equipment: "Server Room" },
    { task: "Battery Backup Test", date: "25/10/2025", priority: "high", equipment: "UPS Systems" },
  ];

  return (
    <AppLayout
      title="Preventive Maintenance"
      homeRoute="/technician"
      navSections={navSections}
      sidebarHeader={
        <PropertySelector
          properties={properties}
          onPropertyChange={setSelectedPropertyId}
        />
      }
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">Maintenance Schedule</h2>
          <p className="text-muted-foreground">Upcoming preventive maintenance tasks</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Scheduled Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {maintenanceTasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-md">
                  <div className="space-y-1">
                    <div className="font-medium">{task.task}</div>
                    <div className="text-sm text-muted-foreground">{task.equipment}</div>
                    <div className="text-xs text-muted-foreground">Due: {task.date}</div>
                  </div>
                  <Badge 
                    variant={task.priority === "high" ? "destructive" : "default"}
                    data-testid={`badge-priority-${index}`}
                  >
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
