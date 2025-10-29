import { 
  type User, 
  type InsertUser, 
  type Incident, 
  type InsertIncident,
  type IncidentTimeline,
  type InsertIncidentTimeline,
  type Organization,
  type InsertOrganization,
  type Property,
  type InsertProperty,
  users,
  incidents,
  incidentTimeline,
  organizations,
  properties
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, sql, asc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUsersByType(userType: string): Promise<User[]>;
  getUsersByOrganization(organizationId: string): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  
  // Organization operations
  getAllOrganizations(): Promise<Organization[]>;
  getOrganization(id: string): Promise<Organization | undefined>;
  updateOrganization(id: string, updates: Partial<Organization>): Promise<Organization | undefined>;
  
  // Property operations
  getPropertiesByOrganization(organizationId: string): Promise<Property[]>;
  getAllProperties(): Promise<Property[]>;
  getProperty(id: string): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: string, updates: Partial<Property>): Promise<Property | undefined>;
  deleteProperty(id: string): Promise<boolean>;
  
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
  private organizations: Map<string, Organization>;
  private properties: Map<string, Property>;

  constructor() {
    this.users = new Map();
    this.incidents = new Map();
    this.incidentTimelines = new Map();
    this.organizations = new Map();
    this.properties = new Map();
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

  async getUsersByType(userType: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.userType === userType
    );
  }

  async getUsersByOrganization(organizationId: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.organizationId === organizationId
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      userType: insertUser.userType ?? "platform",
      propertyId: insertUser.propertyId ?? null,
      organizationId: insertUser.organizationId ?? null,
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const existing = this.users.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  // Organization operations
  async getAllOrganizations(): Promise<Organization[]> {
    return Array.from(this.organizations.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getOrganization(id: string): Promise<Organization | undefined> {
    return this.organizations.get(id);
  }

  async updateOrganization(id: string, updates: Partial<Organization>): Promise<Organization | undefined> {
    const existing = this.organizations.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.organizations.set(id, updated);
    return updated;
  }

  // Property operations
  async getPropertiesByOrganization(organizationId: string): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(
      (property) => property.organizationId === organizationId
    );
  }

  async getAllProperties(): Promise<Property[]> {
    return Array.from(this.properties.values());
  }

  async getProperty(id: string): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = randomUUID();
    const property: Property = {
      ...insertProperty,
      id,
      status: insertProperty.status ?? "active",
      timezone: insertProperty.timezone ?? "Africa/Johannesburg",
      address: insertProperty.address ?? null,
      createdAt: new Date(),
    };
    this.properties.set(id, property);
    return property;
  }

  async updateProperty(id: string, updates: Partial<Property>): Promise<Property | undefined> {
    const existing = this.properties.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.properties.set(id, updated);
    return updated;
  }

  async deleteProperty(id: string): Promise<boolean> {
    return this.properties.delete(id);
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

  async getUsersByType(userType: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.userType, userType));
  }

  async getUsersByOrganization(organizationId: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.organizationId, organizationId));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  // Organization operations
  async getAllOrganizations(): Promise<Organization[]> {
    return await db.select().from(organizations).orderBy(asc(organizations.name));
  }

  async getOrganization(id: string): Promise<Organization | undefined> {
    const result = await db.select().from(organizations).where(eq(organizations.id, id));
    return result[0];
  }

  async updateOrganization(id: string, updates: Partial<Organization>): Promise<Organization | undefined> {
    const result = await db.update(organizations)
      .set(updates)
      .where(eq(organizations.id, id))
      .returning();
    return result[0];
  }

  // Property operations
  async getPropertiesByOrganization(organizationId: string): Promise<Property[]> {
    return await db.select().from(properties).where(eq(properties.organizationId, organizationId));
  }

  async getAllProperties(): Promise<Property[]> {
    return await db.select().from(properties);
  }

  async getProperty(id: string): Promise<Property | undefined> {
    const result = await db.select().from(properties).where(eq(properties.id, id));
    return result[0];
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const result = await db.insert(properties).values(insertProperty).returning();
    return result[0];
  }

  async updateProperty(id: string, updates: Partial<Property>): Promise<Property | undefined> {
    const result = await db.update(properties)
      .set(updates)
      .where(eq(properties.id, id))
      .returning();
    return result[0];
  }

  async deleteProperty(id: string): Promise<boolean> {
    const result = await db.delete(properties).where(eq(properties.id, id)).returning();
    return result.length > 0;
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
