export type PropertyStatus = "healthy" | "degraded" | "critical" | "offline";

export interface Property {
  id: string;
  name: string;
  location: string;
  status: PropertyStatus;
  logoUrl?: string;
}

export const PROPERTIES: Property[] = [
  { id: "1", name: "The Table Bay Hotel", location: "Cape Town, Western Cape", status: "healthy", logoUrl: "/uploads/logos/logo-1761738811047-95142463.png" },
  { id: "2", name: "Umhlanga Sands Resort", location: "Durban, KwaZulu-Natal", status: "degraded", logoUrl: "/uploads/logos/logo-1761738811047-95142463.png" },
  { id: "3", name: "Saxon Hotel", location: "Johannesburg, Gauteng", status: "critical", logoUrl: "/uploads/logos/logo-1761738811047-95142463.png" },
  { id: "4", name: "Sandton Sun Hotel", location: "Sandton, Gauteng", status: "healthy", logoUrl: "/uploads/logos/logo-1761763308615-498500058.jpeg" },
  { id: "5", name: "Waterfront Lodge", location: "Cape Town, Western Cape", status: "degraded", logoUrl: "/uploads/logos/logo-1761738811047-95142463.png" },
  { id: "6", name: "Kruger Park Lodge", location: "Mpumalanga", status: "healthy", logoUrl: "/uploads/logos/logo-1761738811047-95142463.png" },
  { id: "7", name: "Plettenberg Bay Resort", location: "Plettenberg Bay, Western Cape", status: "healthy", logoUrl: "/uploads/logos/logo-1761738811047-95142463.png" },
  { id: "8", name: "Durban Beachfront Hotel", location: "Durban, KwaZulu-Natal", status: "degraded", logoUrl: "/uploads/logos/logo-1761738811047-95142463.png" },
];

// Helper function to get property by ID
export function getPropertyById(id: string): Property | undefined {
  return PROPERTIES.find(p => p.id === id);
}

// Helper function to get property by name
export function getPropertyByName(name: string): Property | undefined {
  return PROPERTIES.find(p => p.name === name);
}
