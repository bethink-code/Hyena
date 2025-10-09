import { 
  type User, 
  type InsertUser, 
  type Event, 
  type InsertEvent,
  type EventTimeline,
  type InsertEventTimeline 
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Event operations
  createEvent(event: InsertEvent): Promise<Event>;
  getEvent(id: string): Promise<Event | undefined>;
  getAllEvents(): Promise<Event[]>;
  getEventsByProperty(propertyId: string): Promise<Event[]>;
  getEventsByStatus(status: string): Promise<Event[]>;
  updateEvent(id: string, updates: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<boolean>;
  
  // Event timeline operations
  addEventTimelineEntry(entry: InsertEventTimeline): Promise<EventTimeline>;
  getEventTimeline(eventId: string): Promise<EventTimeline[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private events: Map<string, Event>;
  private eventTimelines: Map<string, EventTimeline[]>;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.eventTimelines = new Map();
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Event operations
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const now = new Date();
    const id = `evt-${Date.now()}-${randomUUID().substring(0, 8)}`;
    const event: Event = {
      id,
      ...insertEvent,
      location: insertEvent.location ?? null,
      category: insertEvent.category ?? null,
      affectedGuests: insertEvent.affectedGuests ?? null,
      estimatedResolution: insertEvent.estimatedResolution ?? null,
      assignedTo: insertEvent.assignedTo ?? null,
      propertyId: insertEvent.propertyId ?? null,
      source: insertEvent.source ?? null,
      rootCause: insertEvent.rootCause ?? null,
      resolution: insertEvent.resolution ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.events.set(event.id, event);
    return event;
  }

  async getEvent(id: string): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async getEventsByProperty(propertyId: string): Promise<Event[]> {
    return Array.from(this.events.values()).filter(
      (event) => event.propertyId === propertyId
    );
  }

  async getEventsByStatus(status: string): Promise<Event[]> {
    return Array.from(this.events.values()).filter(
      (event) => event.status === status
    );
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;
    
    const updatedEvent: Event = {
      ...event,
      ...updates,
      updatedAt: new Date(),
    };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: string): Promise<boolean> {
    const deleted = this.events.delete(id);
    if (deleted) {
      this.eventTimelines.delete(id);
    }
    return deleted;
  }

  // Event timeline operations
  async addEventTimelineEntry(insertEntry: InsertEventTimeline): Promise<EventTimeline> {
    const entry: EventTimeline = {
      id: randomUUID(),
      ...insertEntry,
      timestamp: new Date(),
    };

    const timeline = this.eventTimelines.get(entry.eventId) || [];
    timeline.push(entry);
    this.eventTimelines.set(entry.eventId, timeline);
    
    return entry;
  }

  async getEventTimeline(eventId: string): Promise<EventTimeline[]> {
    return this.eventTimelines.get(eventId) || [];
  }
}

export const storage = new MemStorage();
