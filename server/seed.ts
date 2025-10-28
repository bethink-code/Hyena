import { db } from "./db";
import { organizations } from "@shared/schema";

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

    console.log(`✅ Seeded ${orgs.length} demo organizations (Sun International, Tsogo Sun, Protea Hotels)`);
    console.log("Database seeding completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    // Don't throw - allow app to start even if seeding fails
  }
}
