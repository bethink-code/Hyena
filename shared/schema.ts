import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Organizations table for multi-tenancy and white-labeling
export const organizations = pgTable("organizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  theme: text("theme").notNull().default("table_mountain_blue"), // 'table_mountain_blue' | 'kalahari_gold' | 'sunset_yellow' | 'jacaranda_purple' | 'protea_red'
  logoUrl: text("logo_url"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  contactPerson: text("contact_person"),
  headquarters: text("headquarters"),
  timezone: text("timezone").notNull().default("Africa/Johannesburg"),
  language: text("language").notNull().default("en"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
});

export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type Organization = typeof organizations.$inferSelect;

// Properties table for hotel/property management
export const properties = pgTable("properties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: text("organization_id").notNull(),
  name: text("name").notNull(),
  location: text("location").notNull(), // City/region
  address: text("address"),
  status: text("status").notNull().default("active"), // 'active' | 'inactive' | 'maintenance'
  timezone: text("timezone").notNull().default("Africa/Johannesburg"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
});

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  userType: text("user_type").notNull().default("platform"), // 'platform' | 'organization'
  role: text("role").notNull(), // Platform: 'super_user' | 'hyena_manager' | 'hyena_user' | 'technician' | Organization: 'regional_manager' | 'property_manager'
  propertyId: text("property_id"), // For property_manager role
  organizationId: text("organization_id"), // For organization users
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

const platformRoles = ["super_user", "hyena_manager", "hyena_user", "technician"] as const;
const organizationRoles = ["regional_manager", "property_manager"] as const;

// Base schema without refinements (for use with .partial(), .extend(), etc.)
const baseUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  userType: z.enum(["platform", "organization"]),
  role: z.enum(["super_user", "hyena_manager", "hyena_user", "technician", "regional_manager", "property_manager"]),
  propertyId: z.string().nullable().optional(),
  organizationId: z.string().nullable().optional(),
});

// Export base schema for partial/extended operations
export { baseUserSchema as baseUserInsertSchema };

// Insert schema with validation refinements
export const insertUserSchema = baseUserSchema.refine(
  (data) => {
    // Platform users can only have platform roles
    if (data.userType === "platform" && !platformRoles.includes(data.role as any)) {
      return false;
    }
    // Organization users can only have organization roles
    if (data.userType === "organization" && !organizationRoles.includes(data.role as any)) {
      return false;
    }
    return true;
  },
  {
    message: "Role must match userType (platform roles for platform users, organization roles for organization users)",
    path: ["role"],
  }
).refine(
  (data) => {
    // Organization users must have an organizationId
    if (data.userType === "organization" && !data.organizationId) {
      return false;
    }
    return true;
  },
  {
    message: "organizationId is required for organization users",
    path: ["organizationId"],
  }
);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Incident schema for the incident management system
export const incidents = pgTable("incidents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull(), // 'low' | 'medium' | 'high' | 'critical'
  status: text("status").notNull(), // 'new' | 'assigned' | 'in_progress' | 'resolved' | 'cancelled' | 'on_hold' | 'duplicate'
  location: text("location"),
  category: text("category"),
  affectedGuests: integer("affected_guests"),
  estimatedResolution: text("estimated_resolution"),
  assignedTo: text("assigned_to"),
  propertyId: text("property_id").notNull(),
  source: text("source"), // 'guest_portal' | 'api_monitoring' | 'manual_report' | etc.
  rootCause: text("root_cause"),
  resolution: text("resolution"),
  incidentType: text("incident_type"), // 'reactive' | 'proactive' | 'environmental'
  scheduledFor: timestamp("scheduled_for"), // For planned maintenance / incidents
  metadata: text("metadata"), // JSON string for SA-specific data (load shedding stage, ISP, weather type)
  cancelReason: text("cancel_reason"), // Required when status is 'cancelled'
  holdReason: text("hold_reason"), // Required when status is 'on_hold'
  holdResumeDate: timestamp("hold_resume_date"), // Expected resume date for on_hold incidents
  duplicateOfId: text("duplicate_of_id"), // Reference to original incident if status is 'duplicate'
  requestedInfo: text("requested_info"), // Info requested from reporter or other parties
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const incidentTimeline = pgTable("incident_timeline", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  incidentId: varchar("incident_id").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  action: text("action").notNull(),
  actor: text("actor").notNull(),
});

export const insertIncidentSchema = createInsertSchema(incidents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  scheduledFor: z.union([z.date(), z.string().datetime()]).optional(),
});

export const updateIncidentSchema = insertIncidentSchema.partial().extend({
  holdResumeDate: z.union([z.date(), z.string().datetime(), z.null()]).optional(),
  scheduledFor: z.union([z.date(), z.string().datetime(), z.null()]).optional(),
}).refine(
  (data) => {
    if (data.status === 'cancelled' && !data.cancelReason) {
      return false;
    }
    return true;
  },
  {
    message: "cancelReason is required when status is 'cancelled'",
    path: ["cancelReason"],
  }
).refine(
  (data) => {
    if (data.status === 'on_hold' && !data.holdReason) {
      return false;
    }
    return true;
  },
  {
    message: "holdReason is required when status is 'on_hold'",
    path: ["holdReason"],
  }
);

export const insertIncidentTimelineSchema = createInsertSchema(incidentTimeline).omit({
  id: true,
  timestamp: true,
});

export type InsertIncident = z.infer<typeof insertIncidentSchema>;
export type UpdateIncident = z.infer<typeof updateIncidentSchema>;
export type Incident = typeof incidents.$inferSelect;
export type InsertIncidentTimeline = z.infer<typeof insertIncidentTimelineSchema>;
export type IncidentTimeline = typeof incidentTimeline.$inferSelect;
