import { db } from "./db";
import { organizations, properties } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function seedDatabase() {
  try {
    // Check if organizations already exist
    const existingOrgs = await db.select().from(organizations);
    
    if (existingOrgs.length > 0) {
      console.log(`Database already seeded with ${existingOrgs.length} organizations`);
      return;
    }

    // Seed organizations with South African hotel chains
    const orgs = await db.insert(organizations).values([
      {
        id: "org-sun-international",
        name: "Sun International",
        theme: "table_mountain_blue",
        logoUrl: null,
      },
      {
        id: "org-tsogo-sun",
        name: "Tsogo Sun",
        theme: "kalahari_gold",
        logoUrl: null,
      },
      {
        id: "org-protea-hotels",
        name: "Protea Hotels",
        theme: "protea_red",
        logoUrl: null,
      },
    ]).returning();

    console.log(`Seeded ${orgs.length} organizations`);

    // Seed properties for each organization
    const props = await db.insert(properties).values([
      // Sun International properties
      {
        id: "1",
        name: "Sun City Resort",
        location: "North West, South Africa",
        organizationId: "org-sun-international",
      },
      {
        id: "2",
        name: "The Table Bay Hotel",
        location: "Cape Town, South Africa",
        organizationId: "org-sun-international",
      },
      // Tsogo Sun properties
      {
        id: "3",
        name: "Southern Sun Waterfront",
        location: "Cape Town, South Africa",
        organizationId: "org-tsogo-sun",
      },
      {
        id: "4",
        name: "Garden Court Umhlanga",
        location: "Durban, South Africa",
        organizationId: "org-tsogo-sun",
      },
      // Protea Hotels properties
      {
        id: "5",
        name: "Protea Hotel Fire & Ice",
        location: "Johannesburg, South Africa",
        organizationId: "org-protea-hotels",
      },
    ]).returning();

    console.log(`Seeded ${props.length} properties`);
    console.log("Database seeding completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    // Don't throw - allow app to start even if seeding fails
  }
}
