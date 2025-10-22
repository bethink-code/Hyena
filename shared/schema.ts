import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(), // 'manager' | 'admin' | 'technician' | 'guest'
  propertyId: text("property_id"), // null for admin (all properties)
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  propertyId: z.string().nullable().optional(),
});

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
