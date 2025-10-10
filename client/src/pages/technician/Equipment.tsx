import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PropertySelector } from "@/components/PropertySelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, History, Calendar, Wrench } from "lucide-react";

export default function Equipment() {
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

  const equipment = [
    { name: "Spare Router", quantity: 2, status: "available", location: "Storage Room" },
    { name: "Ethernet Cables (Cat6)", quantity: 50, status: "available", location: "Storage Room" },
    { name: "Access Point Units", quantity: 3, status: "available", location: "Storage Room" },
    { name: "Network Switch", quantity: 1, status: "in-use", location: "Deployed" },
    { name: "Cable Tester", quantity: 2, status: "available", location: "Technician Van" },
  ];

  return (
    <AppLayout
      title="Equipment Inventory"
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
          <h2 className="text-2xl font-bold mb-1">Equipment & Tools</h2>
          <p className="text-muted-foreground">Track available equipment and inventory</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {equipment.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-md">
                  <div className="space-y-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">{item.location}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">Qty: {item.quantity}</div>
                    </div>
                    <Badge 
                      variant={item.status === "available" ? "default" : "outline"}
                      data-testid={`badge-status-${index}`}
                    >
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
