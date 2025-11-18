export type PropertyStatus = "healthy" | "degraded" | "critical" | "offline";

export interface Property {
  id: string;
  name: string;
  location: string;
  status: PropertyStatus;
  logoUrl?: string;
}

export const PROPERTIES: Property[] = [
  { id: "1", name: "The Table Bay Hotel", location: "Cape Town, Western Cape", status: "healthy", logoUrl: "https://placehold.co/120x40/1e40af/white?text=Table+Bay" },
  { id: "2", name: "Umhlanga Sands Resort", location: "Durban, KwaZulu-Natal", status: "degraded", logoUrl: "https://placehold.co/120x40/1e40af/white?text=Umhlanga" },
  { id: "3", name: "Saxon Hotel", location: "Johannesburg, Gauteng", status: "critical", logoUrl: "https://placehold.co/120x40/1e40af/white?text=Saxon" },
  { id: "4", name: "Sandton Sun Hotel", location: "Sandton, Gauteng", status: "healthy", logoUrl: "https://placehold.co/120x40/1e40af/white?text=Sandton+Sun" },
  { id: "5", name: "Waterfront Lodge", location: "Cape Town, Western Cape", status: "degraded", logoUrl: "https://placehold.co/120x40/1e40af/white?text=Waterfront" },
  { id: "6", name: "Kruger Park Lodge", location: "Mpumalanga", status: "healthy", logoUrl: "https://placehold.co/120x40/1e40af/white?text=Kruger" },
  { id: "7", name: "Plettenberg Bay Resort", location: "Plettenberg Bay, Western Cape", status: "healthy", logoUrl: "https://placehold.co/120x40/1e40af/white?text=Plettenberg" },
  { id: "8", name: "Durban Beachfront Hotel", location: "Durban, KwaZulu-Natal", status: "degraded", logoUrl: "https://placehold.co/120x40/1e40af/white?text=Durban" },
];

// Helper function to get property by ID
export function getPropertyById(id: string): Property | undefined {
  return PROPERTIES.find(p => p.id === id);
}

// Helper function to get property by name
export function getPropertyByName(name: string): Property | undefined {
  return PROPERTIES.find(p => p.name === name);
}
