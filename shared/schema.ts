import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Event schema for the event management system
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull(), // 'low' | 'medium' | 'high' | 'critical'
  status: text("status").notNull(), // 'new' | 'assigned' | 'in_progress' | 'resolved'
  location: text("location"),
  category: text("category"),
  affectedGuests: integer("affected_guests"),
  estimatedResolution: text("estimated_resolution"),
  assignedTo: text("assigned_to"),
  propertyId: text("property_id").notNull(),
  source: text("source"), // 'guest_portal' | 'api_monitoring' | 'manual_report' | etc.
  rootCause: text("root_cause"),
  resolution: text("resolution"),
  eventType: text("event_type"), // 'reactive' | 'proactive' | 'environmental'
  scheduledFor: timestamp("scheduled_for"), // For planned maintenance / events
  metadata: text("metadata"), // JSON string for SA-specific data (load shedding stage, ISP, weather type)
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const eventTimeline = pgTable("event_timeline", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  action: text("action").notNull(),
  actor: text("actor").notNull(),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventTimelineSchema = createInsertSchema(eventTimeline).omit({
  id: true,
  timestamp: true,
});

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEventTimeline = z.infer<typeof insertEventTimelineSchema>;
export type EventTimeline = typeof eventTimeline.$inferSelect;
