export type PropertyStatus = "healthy" | "degraded" | "critical" | "offline";

export interface Property {
  id: string;
  name: string;
  location: string;
  status: PropertyStatus;
}

export const PROPERTIES: Property[] = [
  { id: "1", name: "The Table Bay Hotel", location: "Cape Town, Western Cape", status: "healthy" },
  { id: "2", name: "Umhlanga Sands Resort", location: "Durban, KwaZulu-Natal", status: "degraded" },
  { id: "3", name: "Saxon Hotel", location: "Johannesburg, Gauteng", status: "critical" },
  { id: "4", name: "Sandton Sun Hotel", location: "Sandton, Gauteng", status: "healthy" },
  { id: "5", name: "Waterfront Lodge", location: "Cape Town, Western Cape", status: "degraded" },
  { id: "6", name: "Kruger Park Lodge", location: "Mpumalanga", status: "healthy" },
  { id: "7", name: "Plettenberg Bay Resort", location: "Plettenberg Bay, Western Cape", status: "healthy" },
  { id: "8", name: "Durban Beachfront Hotel", location: "Durban, KwaZulu-Natal", status: "degraded" },
];

// Helper function to get property by ID
export function getPropertyById(id: string): Property | undefined {
  return PROPERTIES.find(p => p.id === id);
}

// Helper function to get property by name
export function getPropertyByName(name: string): Property | undefined {
  return PROPERTIES.find(p => p.name === name);
}
