var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/app.ts
import express2 from "express";
import path3 from "path";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  baseUserInsertSchema: () => baseUserSchema,
  helpComments: () => helpComments,
  incidentTimeline: () => incidentTimeline,
  incidents: () => incidents,
  insertHelpCommentSchema: () => insertHelpCommentSchema,
  insertIncidentSchema: () => insertIncidentSchema,
  insertIncidentTimelineSchema: () => insertIncidentTimelineSchema,
  insertOrganizationSchema: () => insertOrganizationSchema,
  insertPropertySchema: () => insertPropertySchema,
  insertUserSchema: () => insertUserSchema,
  organizations: () => organizations,
  properties: () => properties,
  updateIncidentSchema: () => updateIncidentSchema,
  users: () => users
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var organizations = pgTable("organizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  active: boolean("active").notNull().default(true),
  theme: text("theme").notNull().default("table_mountain_blue"),
  // 'table_mountain_blue' | 'kalahari_gold' | 'sunset_yellow' | 'jacaranda_purple' | 'protea_red'
  logoUrl: text("logo_url"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  contactPerson: text("contact_person"),
  headquarters: text("headquarters"),
  timezone: text("timezone").notNull().default("Africa/Johannesburg"),
  language: text("language").notNull().default("en"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true
});
var properties = pgTable("properties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: text("organization_id").notNull(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  // City/region
  address: text("address"),
  status: text("status").notNull().default("active"),
  // 'active' | 'inactive' | 'maintenance'
  timezone: text("timezone").notNull().default("Africa/Johannesburg"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true
});
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  userType: text("user_type").notNull().default("platform"),
  // 'platform' | 'organization'
  role: text("role").notNull(),
  // Platform: 'super_user' | 'hyena_manager' | 'hyena_user' | 'technician' | Organization: 'regional_manager' | 'property_manager'
  propertyId: text("property_id"),
  // For property_manager role
  organizationId: text("organization_id"),
  // For organization users
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var platformRoles = ["super_user", "hyena_manager", "hyena_user", "technician"];
var organizationRoles = ["regional_manager", "property_manager"];
var baseUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
}).extend({
  userType: z.enum(["platform", "organization"]),
  role: z.enum(["super_user", "hyena_manager", "hyena_user", "technician", "regional_manager", "property_manager"]),
  propertyId: z.string().nullable().optional(),
  organizationId: z.string().nullable().optional()
});
var insertUserSchema = baseUserSchema.refine(
  (data) => {
    if (data.userType === "platform" && !platformRoles.includes(data.role)) {
      return false;
    }
    if (data.userType === "organization" && !organizationRoles.includes(data.role)) {
      return false;
    }
    return true;
  },
  {
    message: "Role must match userType (platform roles for platform users, organization roles for organization users)",
    path: ["role"]
  }
).refine(
  (data) => {
    if (data.userType === "organization" && !data.organizationId) {
      return false;
    }
    return true;
  },
  {
    message: "organizationId is required for organization users",
    path: ["organizationId"]
  }
);
var incidents = pgTable("incidents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull(),
  // 'low' | 'medium' | 'high' | 'critical'
  status: text("status").notNull(),
  // 'new' | 'assigned' | 'in_progress' | 'resolved' | 'cancelled' | 'on_hold' | 'duplicate'
  location: text("location"),
  category: text("category"),
  affectedGuests: integer("affected_guests"),
  estimatedResolution: text("estimated_resolution"),
  assignedTo: text("assigned_to"),
  propertyId: text("property_id").notNull(),
  source: text("source"),
  // 'guest_portal' | 'api_monitoring' | 'manual_report' | etc.
  itemType: text("item_type").notNull().default("incident"),
  // 'alert' (informational status) | 'incident' (actionable work item)
  rootCause: text("root_cause"),
  resolution: text("resolution"),
  incidentType: text("incident_type"),
  // 'reactive' | 'proactive' | 'environmental'
  scheduledFor: timestamp("scheduled_for"),
  // For planned maintenance / incidents
  metadata: text("metadata"),
  // JSON string for SA-specific data (load shedding stage, ISP, weather type)
  cancelReason: text("cancel_reason"),
  // Required when status is 'cancelled'
  holdReason: text("hold_reason"),
  // Required when status is 'on_hold'
  holdResumeDate: timestamp("hold_resume_date"),
  // Expected resume date for on_hold incidents
  duplicateOfId: text("duplicate_of_id"),
  // Reference to original incident if status is 'duplicate'
  requestedInfo: text("requested_info"),
  // Info requested from reporter or other parties
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var incidentTimeline = pgTable("incident_timeline", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  incidentId: varchar("incident_id").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  action: text("action").notNull(),
  actor: text("actor").notNull()
});
var insertIncidentSchema = createInsertSchema(incidents).omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  itemType: z.enum(["alert", "incident"]).default("incident"),
  scheduledFor: z.union([z.date(), z.string().datetime()]).optional()
});
var updateIncidentSchema = insertIncidentSchema.partial().extend({
  holdResumeDate: z.union([z.date(), z.string().datetime(), z.null()]).optional(),
  scheduledFor: z.union([z.date(), z.string().datetime(), z.null()]).optional()
}).refine(
  (data) => {
    if (data.status === "cancelled" && !data.cancelReason) {
      return false;
    }
    return true;
  },
  {
    message: "cancelReason is required when status is 'cancelled'",
    path: ["cancelReason"]
  }
).refine(
  (data) => {
    if (data.status === "on_hold" && !data.holdReason) {
      return false;
    }
    return true;
  },
  {
    message: "holdReason is required when status is 'on_hold'",
    path: ["holdReason"]
  }
);
var insertIncidentTimelineSchema = createInsertSchema(incidentTimeline).omit({
  id: true,
  timestamp: true
});
var helpComments = pgTable("help_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  route: text("route").notNull(),
  // Page route like '/manager', '/admin', '/technician'
  authorName: text("author_name").notNull(),
  authorRole: text("author_role").notNull(),
  // User role or stakeholder type
  body: text("body").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertHelpCommentSchema = createInsertSchema(helpComments).omit({
  id: true,
  createdAt: true
});

// server/storage.ts
import { randomUUID } from "crypto";

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, sql as sql2, asc } from "drizzle-orm";
var DbStorage = class {
  // User operations
  async getUser(id) {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }
  async getUserByUsername(username) {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }
  async getAllUsers() {
    return await db.select().from(users);
  }
  async getUsersByType(userType) {
    return await db.select().from(users).where(eq(users.userType, userType));
  }
  async getUsersByOrganization(organizationId) {
    return await db.select().from(users).where(eq(users.organizationId, organizationId));
  }
  async createUser(insertUser) {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }
  async updateUser(id, updates) {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }
  async deleteUser(id) {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }
  // Organization operations
  async getAllOrganizations() {
    return await db.select().from(organizations).orderBy(asc(organizations.name));
  }
  async getOrganization(id) {
    const result = await db.select().from(organizations).where(eq(organizations.id, id));
    return result[0];
  }
  async updateOrganization(id, updates) {
    const result = await db.update(organizations).set(updates).where(eq(organizations.id, id)).returning();
    return result[0];
  }
  // Property operations
  async getPropertiesByOrganization(organizationId) {
    return await db.select().from(properties).where(eq(properties.organizationId, organizationId));
  }
  async getAllProperties() {
    return await db.select().from(properties);
  }
  async getProperty(id) {
    const result = await db.select().from(properties).where(eq(properties.id, id));
    return result[0];
  }
  async createProperty(insertProperty) {
    const result = await db.insert(properties).values(insertProperty).returning();
    return result[0];
  }
  async updateProperty(id, updates) {
    const result = await db.update(properties).set(updates).where(eq(properties.id, id)).returning();
    return result[0];
  }
  async deleteProperty(id) {
    const result = await db.delete(properties).where(eq(properties.id, id)).returning();
    return result.length > 0;
  }
  // Incident operations
  async createIncident(insertIncident) {
    const id = `inc-${Date.now()}-${randomUUID().substring(0, 8)}`;
    const scheduledFor = insertIncident.scheduledFor ? typeof insertIncident.scheduledFor === "string" ? new Date(insertIncident.scheduledFor) : insertIncident.scheduledFor : void 0;
    const holdResumeDate = insertIncident.holdResumeDate ? typeof insertIncident.holdResumeDate === "string" ? new Date(insertIncident.holdResumeDate) : insertIncident.holdResumeDate : void 0;
    const result = await db.insert(incidents).values({
      ...insertIncident,
      id,
      scheduledFor,
      holdResumeDate
    }).returning();
    return result[0];
  }
  async getIncident(id) {
    const result = await db.select().from(incidents).where(eq(incidents.id, id));
    return result[0];
  }
  async getAllIncidents() {
    return await db.select().from(incidents);
  }
  async getIncidentsByProperty(propertyId) {
    return await db.select().from(incidents).where(eq(incidents.propertyId, propertyId));
  }
  async getIncidentsByStatus(status) {
    return await db.select().from(incidents).where(eq(incidents.status, status));
  }
  async updateIncident(id, updates) {
    const result = await db.update(incidents).set({
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(incidents.id, id)).returning();
    return result[0];
  }
  async deleteIncident(id) {
    const result = await db.delete(incidents).where(eq(incidents.id, id)).returning();
    return result.length > 0;
  }
  // Incident timeline operations
  async addIncidentTimelineEntry(insertEntry) {
    const result = await db.insert(incidentTimeline).values(insertEntry).returning();
    return result[0];
  }
  async getIncidentTimeline(incidentId) {
    return await db.select().from(incidentTimeline).where(eq(incidentTimeline.incidentId, incidentId));
  }
  // Help comment operations
  async createHelpComment(insertComment) {
    const result = await db.insert(helpComments).values(insertComment).returning();
    return result[0];
  }
  async getHelpCommentsByRoute(route) {
    return await db.select().from(helpComments).where(eq(helpComments.route, route)).orderBy(sql2`${helpComments.createdAt} DESC`);
  }
  async getAllHelpComments() {
    return await db.select().from(helpComments).orderBy(sql2`${helpComments.createdAt} DESC`);
  }
  async deleteHelpComment(id) {
    const result = await db.delete(helpComments).where(eq(helpComments.id, id)).returning();
    return result.length > 0;
  }
};
var storage = new DbStorage();

// server/routes.ts
import { z as z2 } from "zod";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import { put, list, del } from "@vercel/blob";
async function registerRoutes(app) {
  const sanitizeUser = (user) => {
    const { password, ...sanitized } = user;
    return sanitized;
  };
  app.get("/api/users", async (req, res) => {
    try {
      const { type, organizationId } = req.query;
      let users2;
      if (type) {
        users2 = await storage.getUsersByType(type);
      } else if (organizationId) {
        users2 = await storage.getUsersByOrganization(organizationId);
      } else {
        users2 = await storage.getAllUsers();
      }
      const sanitizedUsers = users2.map(sanitizeUser);
      res.json(sanitizedUsers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.post("/api/users", async (req, res) => {
    try {
      const validatedUser = insertUserSchema.parse(req.body);
      const platformRoles2 = ["super_user", "hyena_manager", "hyena_user", "technician"];
      const organizationRoles2 = ["regional_manager", "property_manager"];
      if (validatedUser.userType === "platform") {
        if (!platformRoles2.includes(validatedUser.role)) {
          return res.status(400).json({
            error: "Invalid role for platform user. Must be: super_user, hyena_manager, hyena_user, or technician"
          });
        }
      } else if (validatedUser.userType === "organization") {
        if (!organizationRoles2.includes(validatedUser.role)) {
          return res.status(400).json({
            error: "Invalid role for organization user. Must be: regional_manager or property_manager"
          });
        }
        if (!validatedUser.organizationId) {
          return res.status(400).json({
            error: "organizationId is required for organization users"
          });
        }
      } else {
        return res.status(400).json({
          error: 'userType must be either "platform" or "organization"'
        });
      }
      const hashedPassword = await bcrypt.hash(validatedUser.password, 10);
      const user = await storage.createUser({
        ...validatedUser,
        password: hashedPassword
      });
      res.json(sanitizeUser(user));
    } catch (error) {
      if (error.name === "ZodError") {
        res.status(400).json({ error: "Invalid user data", details: error.errors });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });
  app.patch("/api/users/:id", async (req, res) => {
    try {
      const updateSchema = baseUserSchema.partial().omit({ password: true });
      const validatedData = updateSchema.parse(req.body);
      const existingUser = await storage.getUser(req.params.id);
      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }
      const platformRoles2 = ["super_user", "hyena_manager", "hyena_user", "technician"];
      const organizationRoles2 = ["regional_manager", "property_manager"];
      const finalUserType = validatedData.userType ?? existingUser.userType;
      const finalRole = validatedData.role ?? existingUser.role;
      if (finalUserType === "platform") {
        if (!platformRoles2.includes(finalRole)) {
          return res.status(400).json({
            error: "Invalid role for platform user. Must be: super_user, hyena_manager, hyena_user, or technician"
          });
        }
      } else if (finalUserType === "organization") {
        if (!organizationRoles2.includes(finalRole)) {
          return res.status(400).json({
            error: "Invalid role for organization user. Must be: regional_manager or property_manager"
          });
        }
        const finalOrgId = validatedData.organizationId ?? existingUser.organizationId;
        if (!finalOrgId) {
          return res.status(400).json({
            error: "organizationId is required for organization users"
          });
        }
      }
      const user = await storage.updateUser(req.params.id, validatedData);
      res.json(sanitizeUser(user));
    } catch (error) {
      if (error.name === "ZodError") {
        res.status(400).json({ error: "Invalid user data", details: error.errors });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });
  app.delete("/api/users/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteUser(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.get("/api/organizations", async (req, res) => {
    try {
      const organizations2 = await storage.getAllOrganizations();
      res.json(organizations2);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.get("/api/organizations/:id", async (req, res) => {
    try {
      const organization = await storage.getOrganization(req.params.id);
      if (!organization) {
        return res.status(404).json({ error: "Organization not found" });
      }
      res.json(organization);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.patch("/api/organizations/:id", async (req, res) => {
    try {
      const updateSchema = z2.object({
        name: z2.string().optional(),
        active: z2.boolean().optional(),
        theme: z2.enum(["table_mountain_blue", "kalahari_gold", "sunset_yellow", "jacaranda_purple", "protea_red"]).optional(),
        logoUrl: z2.string().nullable().optional(),
        contactEmail: z2.string().email().nullable().optional(),
        contactPhone: z2.string().nullable().optional(),
        contactPerson: z2.string().nullable().optional(),
        headquarters: z2.string().nullable().optional(),
        timezone: z2.string().optional(),
        language: z2.string().optional()
      });
      const validatedData = updateSchema.parse(req.body);
      if (validatedData.active === true) {
        const allOrganizations = await storage.getAllOrganizations();
        for (const org of allOrganizations) {
          if (org.id !== req.params.id && org.active) {
            await storage.updateOrganization(org.id, { active: false });
          }
        }
      }
      const organization = await storage.updateOrganization(req.params.id, validatedData);
      if (!organization) {
        return res.status(404).json({ error: "Organization not found" });
      }
      res.json(organization);
    } catch (error) {
      if (error.name === "ZodError") {
        res.status(400).json({ error: "Invalid organization data", details: error.errors });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5242880 },
    // 5MB
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif|svg|webp/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      if (extname && mimetype) {
        cb(null, true);
      } else {
        cb(new Error("Only image files are allowed"));
      }
    }
  });
  app.post("/api/organizations/upload-logo", upload.single("logo"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const orgId = req.body.orgId;
      if (!orgId) {
        return res.status(400).json({ error: "Organization ID is required" });
      }
      const ext = path.extname(req.file.originalname);
      const blob = await put(`logos/org-${orgId}-${Date.now()}${ext}`, req.file.buffer, {
        access: "public",
        contentType: req.file.mimetype
      });
      const organization = await storage.updateOrganization(orgId, {
        logoUrl: blob.url
      });
      if (!organization) {
        await del(blob.url).catch(() => {
        });
        return res.status(404).json({ error: "Organization not found" });
      }
      res.json({ logoUrl: blob.url, organization });
    } catch (error) {
      console.error("Error uploading logo:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app.patch("/api/organizations/:id/logo", async (req, res) => {
    try {
      if (!req.body.logoUrl) {
        return res.status(400).json({ error: "logoUrl is required" });
      }
      const organization = await storage.updateOrganization(req.params.id, {
        logoUrl: req.body.logoUrl
      });
      if (!organization) {
        return res.status(404).json({ error: "Organization not found" });
      }
      res.json(organization);
    } catch (error) {
      console.error("Error updating organization logo:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app.post("/api/platform/upload-logo", upload.single("logo"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const existing = await list({ prefix: "platform/" });
      await Promise.all(existing.blobs.map((b) => del(b.url)));
      const ext = path.extname(req.file.originalname);
      const blob = await put(`platform/logo-${Date.now()}${ext}`, req.file.buffer, {
        access: "public",
        contentType: req.file.mimetype
      });
      res.json({ logoUrl: blob.url });
    } catch (error) {
      console.error("Error uploading platform logo:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app.get("/api/platform/logo", async (req, res) => {
    try {
      const result = await list({ prefix: "platform/" });
      const blob = result.blobs[0];
      res.json({ logoUrl: blob?.url ?? null });
    } catch (error) {
      console.error("Error getting platform logo:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app.get("/api/properties", async (req, res) => {
    try {
      const properties2 = await storage.getAllProperties();
      res.json(properties2);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.get("/api/organizations/:id/properties", async (req, res) => {
    try {
      const properties2 = await storage.getPropertiesByOrganization(req.params.id);
      res.json(properties2);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.get("/api/properties/:id", async (req, res) => {
    try {
      const property = await storage.getProperty(req.params.id);
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }
      res.json(property);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.post("/api/organizations/:id/properties", async (req, res) => {
    try {
      const validatedProperty = insertPropertySchema.parse({
        ...req.body,
        organizationId: req.params.id
      });
      const property = await storage.createProperty(validatedProperty);
      res.json(property);
    } catch (error) {
      if (error.name === "ZodError") {
        res.status(400).json({ error: "Invalid property data", details: error.errors });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });
  app.patch("/api/properties/:id", async (req, res) => {
    try {
      const updateSchema = z2.object({
        name: z2.string().optional(),
        location: z2.string().optional(),
        address: z2.string().nullable().optional(),
        status: z2.enum(["active", "inactive", "maintenance"]).optional(),
        timezone: z2.string().optional()
      });
      const validatedData = updateSchema.parse(req.body);
      const property = await storage.updateProperty(req.params.id, validatedData);
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }
      res.json(property);
    } catch (error) {
      if (error.name === "ZodError") {
        res.status(400).json({ error: "Invalid property data", details: error.errors });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });
  app.delete("/api/properties/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteProperty(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Property not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  const incidentQuerySchema = z2.object({
    propertyId: z2.string().optional(),
    status: z2.string().optional()
  });
  const getIncidentsHandler = async (req, res) => {
    try {
      const { propertyId, status } = incidentQuerySchema.parse(req.query);
      let incidents2;
      if (propertyId) {
        incidents2 = await storage.getIncidentsByProperty(propertyId);
        if (status && incidents2) {
          incidents2 = incidents2.filter((incident) => incident.status === status);
        }
      } else if (status) {
        incidents2 = await storage.getIncidentsByStatus(status);
      } else {
        incidents2 = await storage.getAllIncidents();
      }
      res.json(incidents2);
    } catch (error) {
      if (error.name === "ZodError") {
        res.status(400).json({ error: "Invalid query parameters", details: error.errors });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  };
  app.post("/api/incidents", async (req, res) => {
    try {
      const validatedIncident = insertIncidentSchema.parse(req.body);
      const incident = await storage.createIncident(validatedIncident);
      await storage.addIncidentTimelineEntry({
        incidentId: incident.id,
        action: `Incident created from ${incident.source || "unknown source"}`,
        actor: incident.source === "guest_portal" ? "Guest Portal" : "System"
      });
      res.json(incident);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app.get("/api/incidents", getIncidentsHandler);
  app.get("/api/incidents/:id", async (req, res) => {
    try {
      const incident = await storage.getIncident(req.params.id);
      if (!incident) {
        return res.status(404).json({ error: "Incident not found" });
      }
      res.json(incident);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.patch("/api/incidents/:id", async (req, res) => {
    try {
      const validatedUpdate = updateIncidentSchema.parse(req.body);
      const normalizedUpdate = {
        ...validatedUpdate,
        holdResumeDate: typeof validatedUpdate.holdResumeDate === "string" ? new Date(validatedUpdate.holdResumeDate) : validatedUpdate.holdResumeDate,
        scheduledFor: typeof validatedUpdate.scheduledFor === "string" ? new Date(validatedUpdate.scheduledFor) : validatedUpdate.scheduledFor
      };
      const incident = await storage.updateIncident(req.params.id, normalizedUpdate);
      if (!incident) {
        return res.status(404).json({ error: "Incident not found" });
      }
      res.json(incident);
    } catch (error) {
      if (error.name === "ZodError") {
        res.status(400).json({ error: "Invalid update data", details: error.errors });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });
  app.delete("/api/incidents/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteIncident(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Incident not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.get("/api/incidents/property/:propertyId", async (req, res) => {
    try {
      const incidents2 = await storage.getIncidentsByProperty(req.params.propertyId);
      res.json(incidents2);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.get("/api/incidents/status/:status", async (req, res) => {
    try {
      const incidents2 = await storage.getIncidentsByStatus(req.params.status);
      res.json(incidents2);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.post("/api/incidents/:id/timeline", async (req, res) => {
    try {
      const validatedEntry = insertIncidentTimelineSchema.parse({
        ...req.body,
        incidentId: req.params.id
      });
      const entry = await storage.addIncidentTimelineEntry(validatedEntry);
      res.json(entry);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app.get("/api/incidents/:id/timeline", async (req, res) => {
    try {
      const timeline = await storage.getIncidentTimeline(req.params.id);
      res.json(timeline);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.post("/api/incidents/:id/comments", async (req, res) => {
    try {
      const { comment } = req.body;
      if (!comment || typeof comment !== "string" || !comment.trim()) {
        return res.status(400).json({ error: "Comment text is required" });
      }
      const actor = req.user?.username || req.user?.email || "User";
      const validatedEntry = insertIncidentTimelineSchema.parse({
        incidentId: req.params.id,
        action: comment.trim(),
        actor,
        actionType: "comment"
      });
      const entry = await storage.addIncidentTimelineEntry(validatedEntry);
      res.json(entry);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app.get("/api/events", getIncidentsHandler);
  app.get("/api/help/comments/:route", async (req, res) => {
    try {
      const route = decodeURIComponent(req.params.route);
      const comments = await storage.getHelpCommentsByRoute(route);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.post("/api/help/comments", async (req, res) => {
    try {
      const validatedComment = insertHelpCommentSchema.parse(req.body);
      const comment = await storage.createHelpComment(validatedComment);
      res.json(comment);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app.delete("/api/help/comments/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteHelpComment(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Comment not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.get("/api/reports/incidents", async (req, res) => {
    try {
      const allIncidents = await storage.getAllIncidents();
      const incidentsWithMetrics = allIncidents.map((incident) => {
        const createdDate = new Date(incident.createdAt);
        const updatedDate = new Date(incident.updatedAt);
        const resolutionTime = updatedDate.getTime() - createdDate.getTime();
        const resolutionHours = Math.round(resolutionTime / (1e3 * 60 * 60));
        return {
          ...incident,
          resolutionHours,
          isOverdue: incident.status !== "resolved" && resolutionHours > 24
        };
      });
      res.json(incidentsWithMetrics);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.get("/api/reports/sla-performance", async (req, res) => {
    try {
      const allIncidents = await storage.getAllIncidents();
      const slaData = allIncidents.map((incident) => {
        const createdDate = new Date(incident.createdAt);
        const updatedDate = new Date(incident.updatedAt);
        const resolutionTime = updatedDate.getTime() - createdDate.getTime();
        const resolutionHours = Math.round(resolutionTime / (1e3 * 60 * 60));
        const slaTargets = {
          critical: 4,
          high: 8,
          medium: 24,
          low: 48
        };
        const slaTarget = slaTargets[incident.priority] || 24;
        const slaStatus = incident.status === "resolved" ? resolutionHours <= slaTarget ? "met" : "breached" : resolutionHours > slaTarget ? "at_risk" : "on_track";
        return {
          id: incident.id,
          title: incident.title,
          priority: incident.priority,
          status: incident.status,
          propertyId: incident.propertyId,
          createdAt: incident.createdAt,
          resolutionHours,
          slaTarget,
          slaStatus,
          slaBreachBy: slaStatus === "breached" ? resolutionHours - slaTarget : 0
        };
      });
      res.json(slaData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.get("/api/reports/category-analysis", async (req, res) => {
    try {
      const allIncidents = await storage.getAllIncidents();
      const categoryGroups = allIncidents.reduce((acc, incident) => {
        const category = incident.category || "Uncategorized";
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(incident);
        return acc;
      }, {});
      const categoryData = Object.entries(categoryGroups).map(([category, incidents2]) => {
        const totalIncidents = incidents2.length;
        const resolvedIncidents = incidents2.filter((i) => i.status === "resolved").length;
        const criticalIncidents = incidents2.filter((i) => i.priority === "critical").length;
        const avgResolutionTime = incidents2.filter((i) => i.status === "resolved").reduce((sum, i) => {
          const time = new Date(i.updatedAt).getTime() - new Date(i.createdAt).getTime();
          return sum + time / (1e3 * 60 * 60);
        }, 0) / (resolvedIncidents || 1);
        return {
          category,
          totalIncidents,
          resolvedIncidents,
          criticalIncidents,
          avgResolutionTime: Math.round(avgResolutionTime),
          resolutionRate: Math.round(resolvedIncidents / totalIncidents * 100)
        };
      });
      res.json(categoryData.sort((a, b) => b.totalIncidents - a.totalIncidents));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.get("/api/reports/guest-impact", async (req, res) => {
    try {
      const allIncidents = await storage.getAllIncidents();
      const guestImpactData = allIncidents.filter((incident) => incident.affectedGuests && incident.affectedGuests > 0).map((incident) => {
        const createdDate = new Date(incident.createdAt);
        const updatedDate = new Date(incident.updatedAt);
        const resolutionTime = updatedDate.getTime() - createdDate.getTime();
        const resolutionHours = Math.round(resolutionTime / (1e3 * 60 * 60));
        const impactScore = (incident.affectedGuests || 0) * resolutionHours;
        return {
          id: incident.id,
          title: incident.title,
          priority: incident.priority,
          status: incident.status,
          propertyId: incident.propertyId,
          affectedGuests: incident.affectedGuests,
          resolutionHours,
          impactScore,
          createdAt: incident.createdAt,
          category: incident.category
        };
      }).sort((a, b) => b.impactScore - a.impactScore);
      res.json(guestImpactData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.get("/api/reports/user-feedback", async (req, res) => {
    try {
      const allComments = await storage.getAllHelpComments();
      res.json(allComments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  const httpServer = createServer(app);
  return httpServer;
}

// server/vite.ts
import express from "express";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
var vite_config_default = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// server/app.ts
async function createApp() {
  const app = express2();
  const docsPath = path3.join(process.cwd(), "public", "docs");
  app.use("/docs", express2.static(docsPath));
  app.use(express2.json());
  app.use(express2.urlencoded({ extended: false }));
  app.use((req, res, next) => {
    const start = Date.now();
    const reqPath = req.path;
    let capturedJsonResponse = void 0;
    const originalResJson = res.json;
    res.json = function(bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
      const duration = Date.now() - start;
      if (reqPath.startsWith("/api")) {
        let logLine = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }
        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "\u2026";
        }
        log(logLine);
      }
    });
    next();
  });
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  return { app, server };
}

// server/vercelEntry.ts
var ready = createApp();
async function handler(req, res) {
  const { app } = await ready;
  return app(req, res);
}
export {
  handler as default
};
