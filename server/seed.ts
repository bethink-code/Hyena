import { pathToFileURL } from "url";
import { db } from "./db.js";
import { organizations, users } from "../shared/schema.js";
import bcrypt from "bcryptjs";

export async function seedDatabase() {
  try {
    // Seed organizations with South African hotel chains (only if they don't exist)
    const existingOrgs = await db.select().from(organizations);
    
    let orgs = existingOrgs;
    if (existingOrgs.length === 0) {
      orgs = await db.insert(organizations).values([
      {
        id: "org-sun-international",
        name: "Sun International",
        active: true,
        theme: "table_mountain_blue",
        logoUrl: null,
        contactEmail: "info@suninternational.co.za",
        contactPhone: "+27 11 780 7800",
        contactPerson: "Zanele Khumalo",
        headquarters: "Johannesburg, Gauteng",
      },
      {
        id: "org-tsogo-sun",
        name: "Tsogo Sun",
        active: true,
        theme: "kalahari_gold",
        logoUrl: null,
        contactEmail: "contact@tsogosun.com",
        contactPhone: "+27 11 510 8600",
        contactPerson: "Nomvula Dlamini",
        headquarters: "Sandton, Gauteng",
      },
      {
        id: "org-protea-hotels",
        name: "Protea Hotels",
        active: true,
        theme: "protea_red",
        logoUrl: null,
        contactEmail: "reservations@proteahotels.com",
        contactPhone: "+27 21 483 1000",
        contactPerson: "Mandla Ngcobo",
        headquarters: "Cape Town, Western Cape",
      },
      ]).returning();
      console.log(`✅ Seeded ${orgs.length} demo organizations (Sun International, Tsogo Sun, Protea Hotels)`);
    } else {
      console.log(`Organizations already exist (${existingOrgs.length} found)`);
    }

    // Check if users already exist
    const existingUsers = await db.select().from(users);
    if (existingUsers.length > 0) {
      console.log(`Users already exist (${existingUsers.length} found) - skipping user seeding`);
      return;
    }

    // Hash password for all demo users (password: "demo123")
    const hashedPassword = await bcrypt.hash("demo123", 10);

    // Seed platform users with South African names
    const platformUsers = await db.insert(users).values([
      {
        username: "thabo.malema",
        password: hashedPassword,
        name: "Thabo Malema",
        email: "thabo.malema@hyena.co.za",
        userType: "platform",
        role: "super_user",
        propertyId: null,
        organizationId: null,
      },
      {
        username: "naledi.vandermerwe",
        password: hashedPassword,
        name: "Naledi van der Merwe",
        email: "naledi.vandermerwe@hyena.co.za",
        userType: "platform",
        role: "hyena_manager",
        propertyId: null,
        organizationId: null,
      },
      {
        username: "sipho.nkosi",
        password: hashedPassword,
        name: "Sipho Nkosi",
        email: "sipho.nkosi@hyena.co.za",
        userType: "platform",
        role: "hyena_user",
        propertyId: null,
        organizationId: null,
      },
      {
        username: "lerato.botha",
        password: hashedPassword,
        name: "Lerato Botha",
        email: "lerato.botha@hyena.co.za",
        userType: "platform",
        role: "technician",
        propertyId: null,
        organizationId: null,
      },
    ]).returning();

    console.log(`✅ Seeded ${platformUsers.length} platform users`);

    // Seed organization users for Sun International
    const sunUsers = await db.insert(users).values([
      {
        username: "zanele.khumalo",
        password: hashedPassword,
        name: "Zanele Khumalo",
        email: "zanele.khumalo@suninternational.co.za",
        userType: "organization",
        role: "regional_manager",
        propertyId: null,
        organizationId: "org-sun-international",
      },
      {
        username: "pieter.dutoit",
        password: hashedPassword,
        name: "Pieter du Toit",
        email: "pieter.dutoit@suninternational.co.za",
        userType: "organization",
        role: "property_manager",
        propertyId: null,
        organizationId: "org-sun-international",
      },
    ]).returning();

    // Seed organization users for Tsogo Sun
    const tsogoUsers = await db.insert(users).values([
      {
        username: "nomvula.dlamini",
        password: hashedPassword,
        name: "Nomvula Dlamini",
        email: "nomvula.dlamini@tsogosun.com",
        userType: "organization",
        role: "regional_manager",
        propertyId: null,
        organizationId: "org-tsogo-sun",
      },
      {
        username: "johan.venter",
        password: hashedPassword,
        name: "Johan Venter",
        email: "johan.venter@tsogosun.com",
        userType: "organization",
        role: "property_manager",
        propertyId: null,
        organizationId: "org-tsogo-sun",
      },
    ]).returning();

    // Seed organization users for Protea Hotels
    const proteaUsers = await db.insert(users).values([
      {
        username: "mandla.ngcobo",
        password: hashedPassword,
        name: "Mandla Ngcobo",
        email: "mandla.ngcobo@proteahotels.com",
        userType: "organization",
        role: "regional_manager",
        propertyId: null,
        organizationId: "org-protea-hotels",
      },
      {
        username: "annelie.swart",
        password: hashedPassword,
        name: "Annelie Swart",
        email: "annelie.swart@proteahotels.com",
        userType: "organization",
        role: "property_manager",
        propertyId: null,
        organizationId: "org-protea-hotels",
      },
    ]).returning();

    console.log(`✅ Seeded ${sunUsers.length + tsogoUsers.length + proteaUsers.length} organization users`);
    console.log("Database seeding completed successfully");
    console.log("Demo credentials: username = [firstname].[lastname], password = demo123");
  } catch (error) {
    console.error("Error seeding database:", error);
    // Don't throw - allow app to start even if seeding fails
  }
}

// Run seed when this file is invoked directly (e.g., `tsx server/seed.ts`),
// but NOT when imported by server/index.ts on dev startup.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
