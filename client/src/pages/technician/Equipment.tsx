import { useMemo } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { HyenaLogo } from "@/components/HyenaLogo";
import { PropertyList } from "@/components/PropertyList";
import { PROPERTIES } from "@/lib/properties";
import { TECHNICIAN_NAV } from "@/config/navigation";

export default function Equipment() {
  const [, setLocation] = useLocation();
  
  // Mock equipment data for each property
  const equipmentByProperty: Record<string, Array<{ name: string; status: "available" | "in-use" | "maintenance" | "critical"; quantity: number }>> = {
    "1": [
      { name: "Spare Router", status: "available", quantity: 2 },
      { name: "Ethernet Cables (Cat6)", status: "available", quantity: 50 },
      { name: "Access Point Units", status: "available", quantity: 3 },
      { name: "Network Switch", status: "in-use", quantity: 1 },
      { name: "Cable Tester", status: "available", quantity: 2 },
    ],
    "2": [
      { name: "Spare Router", status: "maintenance", quantity: 1 },
      { name: "Ethernet Cables (Cat6)", status: "available", quantity: 30 },
      { name: "Access Point Units", status: "available", quantity: 2 },
      { name: "Network Switch", status: "in-use", quantity: 2 },
      { name: "Cable Tester", status: "maintenance", quantity: 1 },
    ],
    "3": [
      { name: "Spare Router", status: "critical", quantity: 0 },
      { name: "Ethernet Cables (Cat6)", status: "available", quantity: 15 },
      { name: "Access Point Units", status: "critical", quantity: 0 },
      { name: "Network Switch", status: "in-use", quantity: 1 },
      { name: "Cable Tester", status: "available", quantity: 1 },
    ],
    "4": [
      { name: "Spare Router", status: "available", quantity: 3 },
      { name: "Ethernet Cables (Cat6)", status: "available", quantity: 60 },
      { name: "Access Point Units", status: "available", quantity: 4 },
      { name: "Network Switch", status: "in-use", quantity: 2 },
      { name: "Cable Tester", status: "available", quantity: 2 },
    ],
    "5": [
      { name: "Spare Router", status: "available", quantity: 1 },
      { name: "Ethernet Cables (Cat6)", status: "available", quantity: 25 },
      { name: "Access Point Units", status: "maintenance", quantity: 1 },
      { name: "Network Switch", status: "in-use", quantity: 1 },
      { name: "Cable Tester", status: "available", quantity: 1 },
    ],
    "6": [
      { name: "Spare Router", status: "available", quantity: 2 },
      { name: "Ethernet Cables (Cat6)", status: "available", quantity: 40 },
      { name: "Access Point Units", status: "available", quantity: 3 },
      { name: "Network Switch", status: "in-use", quantity: 1 },
      { name: "Cable Tester", status: "available", quantity: 2 },
    ],
    "7": [
      { name: "Spare Router", status: "available", quantity: 2 },
      { name: "Ethernet Cables (Cat6)", status: "available", quantity: 45 },
      { name: "Access Point Units", status: "available", quantity: 3 },
      { name: "Network Switch", status: "in-use", quantity: 1 },
      { name: "Cable Tester", status: "available", quantity: 1 },
    ],
    "8": [
      { name: "Spare Router", status: "maintenance", quantity: 1 },
      { name: "Ethernet Cables (Cat6)", status: "available", quantity: 20 },
      { name: "Access Point Units", status: "maintenance", quantity: 1 },
      { name: "Network Switch", status: "in-use", quantity: 2 },
      { name: "Cable Tester", status: "maintenance", quantity: 1 },
    ],
  };

  // Calculate equipment health status for each property
  const propertiesWithEquipmentHealth = useMemo(() => {
    return PROPERTIES.map(property => {
      const equipment = equipmentByProperty[property.id] || [];
      
      // Calculate equipment metrics
      const totalEquipment = equipment.reduce((sum, item) => sum + item.quantity, 0);
      const criticalItems = equipment.filter(item => item.status === "critical").length;
      const maintenanceItems = equipment.filter(item => item.status === "maintenance").length;
      const availableItems = equipment.filter(item => item.status === "available").length;
      
      // Determine overall equipment status
      let equipmentStatus: "healthy" | "degraded" | "critical" | "offline" = "healthy";
      if (criticalItems >= 2) {
        equipmentStatus = "critical";
      } else if (criticalItems >= 1 || maintenanceItems >= 2) {
        equipmentStatus = "degraded";
      } else if (maintenanceItems >= 1) {
        equipmentStatus = "degraded";
      }

      // Count equipment issues as incident count for the card
      const incidentCount = criticalItems + maintenanceItems;
      const criticalIncidentCount = criticalItems;

      return {
        ...property,
        status: equipmentStatus,
        incidentCount,
        criticalCount: criticalIncidentCount,
        newCount: 0,
      };
    });
  }, []);

  return (
    <AppLayout
      title="Equipment Inventory"
      homeRoute="/technician"
      navSections={TECHNICIAN_NAV}
      sidebarHeader={<HyenaLogo />}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-1">Equipment & Tools</h2>
          <p className="text-muted-foreground">Track equipment inventory and maintenance needs across all properties</p>
        </div>

        <PropertyList
          properties={propertiesWithEquipmentHealth}
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
