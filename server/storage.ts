import { 
  type User, 
  type InsertUser, 
  type Incident, 
  type InsertIncident,
  type IncidentTimeline,
  type InsertIncidentTimeline,
  users,
  incidents,
  incidentTimeline 
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  
  // Incident operations
  createIncident(incident: InsertIncident): Promise<Incident>;
  getIncident(id: string): Promise<Incident | undefined>;
  getAllIncidents(): Promise<Incident[]>;
  getIncidentsByProperty(propertyId: string): Promise<Incident[]>;
  getIncidentsByStatus(status: string): Promise<Incident[]>;
  updateIncident(id: string, updates: Partial<Incident>): Promise<Incident | undefined>;
  deleteIncident(id: string): Promise<boolean>;
  
  // Incident timeline operations
  addIncidentTimelineEntry(entry: InsertIncidentTimeline): Promise<IncidentTimeline>;
  getIncidentTimeline(incidentId: string): Promise<IncidentTimeline[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private incidents: Map<string, Incident>;
  private incidentTimelines: Map<string, IncidentTimeline[]>;

  constructor() {
    this.users = new Map();
    this.incidents = new Map();
    this.incidentTimelines = new Map();
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      propertyId: insertUser.propertyId ?? null,
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  // Incident operations
  async createIncident(insertIncident: InsertIncident): Promise<Incident> {
    const now = new Date();
    const id = `inc-${Date.now()}-${randomUUID().substring(0, 8)}`;
    const scheduledFor = insertIncident.scheduledFor 
      ? (typeof insertIncident.scheduledFor === 'string' 
          ? new Date(insertIncident.scheduledFor) 
          : insertIncident.scheduledFor)
      : null;
    
    const incident: Incident = {
      id,
      ...insertIncident,
      location: insertIncident.location ?? null,
      category: insertIncident.category ?? null,
      affectedGuests: insertIncident.affectedGuests ?? null,
      estimatedResolution: insertIncident.estimatedResolution ?? null,
      assignedTo: insertIncident.assignedTo ?? null,
      propertyId: insertIncident.propertyId ?? null,
      source: insertIncident.source ?? null,
      rootCause: insertIncident.rootCause ?? null,
      resolution: insertIncident.resolution ?? null,
      incidentType: insertIncident.incidentType ?? null,
      scheduledFor,
      metadata: insertIncident.metadata ?? null,
      cancelReason: insertIncident.cancelReason ?? null,
      holdReason: insertIncident.holdReason ?? null,
      holdResumeDate: insertIncident.holdResumeDate ?? null,
      duplicateOfId: insertIncident.duplicateOfId ?? null,
      requestedInfo: insertIncident.requestedInfo ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.incidents.set(incident.id, incident);
    return incident;
  }

  async getIncident(id: string): Promise<Incident | undefined> {
    return this.incidents.get(id);
  }

  async getAllIncidents(): Promise<Incident[]> {
    return Array.from(this.incidents.values());
  }

  async getIncidentsByProperty(propertyId: string): Promise<Incident[]> {
    return Array.from(this.incidents.values()).filter(
      (incident) => incident.propertyId === propertyId
    );
  }

  async getIncidentsByStatus(status: string): Promise<Incident[]> {
    return Array.from(this.incidents.values()).filter(
      (incident) => incident.status === status
    );
  }

  async updateIncident(id: string, updates: Partial<Incident>): Promise<Incident | undefined> {
    const incident = this.incidents.get(id);
    if (!incident) return undefined;
    
    const updatedIncident: Incident = {
      ...incident,
      ...updates,
      updatedAt: new Date(),
    };
    this.incidents.set(id, updatedIncident);
    return updatedIncident;
  }

  async deleteIncident(id: string): Promise<boolean> {
    const deleted = this.incidents.delete(id);
    if (deleted) {
      this.incidentTimelines.delete(id);
    }
    return deleted;
  }

  // Incident timeline operations
  async addIncidentTimelineEntry(insertEntry: InsertIncidentTimeline): Promise<IncidentTimeline> {
    const entry: IncidentTimeline = {
      id: randomUUID(),
      ...insertEntry,
      timestamp: new Date(),
    };

    const timeline = this.incidentTimelines.get(entry.incidentId) || [];
    timeline.push(entry);
    this.incidentTimelines.set(entry.incidentId, timeline);
    
    return entry;
  }

  async getIncidentTimeline(incidentId: string): Promise<IncidentTimeline[]> {
    return this.incidentTimelines.get(incidentId) || [];
  }
}

// Database Storage Implementation using Drizzle ORM
export class DbStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Incident operations
  async createIncident(insertIncident: InsertIncident): Promise<Incident> {
    const id = `inc-${Date.now()}-${randomUUID().substring(0, 8)}`;
    const scheduledFor = insertIncident.scheduledFor 
      ? (typeof insertIncident.scheduledFor === 'string' 
          ? new Date(insertIncident.scheduledFor) 
          : insertIncident.scheduledFor)
      : undefined;
    
    const holdResumeDate = insertIncident.holdResumeDate
      ? (typeof insertIncident.holdResumeDate === 'string'
          ? new Date(insertIncident.holdResumeDate)
          : insertIncident.holdResumeDate)
      : undefined;
    
    const result = await db.insert(incidents).values({
      ...insertIncident,
      id,
      scheduledFor,
      holdResumeDate,
    }).returning();
    return result[0];
  }

  async getIncident(id: string): Promise<Incident | undefined> {
    const result = await db.select().from(incidents).where(eq(incidents.id, id));
    return result[0];
  }

  async getAllIncidents(): Promise<Incident[]> {
    return await db.select().from(incidents);
  }

  async getIncidentsByProperty(propertyId: string): Promise<Incident[]> {
    return await db.select().from(incidents).where(eq(incidents.propertyId, propertyId));
  }

  async getIncidentsByStatus(status: string): Promise<Incident[]> {
    return await db.select().from(incidents).where(eq(incidents.status, status));
  }

  async updateIncident(id: string, updates: Partial<Incident>): Promise<Incident | undefined> {
    const result = await db.update(incidents)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(incidents.id, id))
      .returning();
    return result[0];
  }

  async deleteIncident(id: string): Promise<boolean> {
    const result = await db.delete(incidents).where(eq(incidents.id, id)).returning();
    return result.length > 0;
  }

  // Incident timeline operations
  async addIncidentTimelineEntry(insertEntry: InsertIncidentTimeline): Promise<IncidentTimeline> {
    const result = await db.insert(incidentTimeline).values(insertEntry).returning();
    return result[0];
  }

  async getIncidentTimeline(incidentId: string): Promise<IncidentTimeline[]> {
    return await db.select().from(incidentTimeline).where(eq(incidentTimeline.incidentId, incidentId));
  }
}

// Use Database storage instead of in-memory storage
export const storage = new DbStorage();
