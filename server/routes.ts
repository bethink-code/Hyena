import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEventSchema, insertEventTimelineSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Event routes
  
  // Create a new event
  app.post("/api/events", async (req, res) => {
    try {
      const validatedEvent = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(validatedEvent);
      
      // Add initial timeline entry
      await storage.addEventTimelineEntry({
        eventId: event.id,
        action: `Event created from ${event.source || 'unknown source'}`,
        actor: event.source === 'guest_portal' ? 'Guest Portal' : 'System',
      });
      
      res.json(event);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get all events (with optional propertyId filter)
  app.get("/api/events", async (req, res) => {
    try {
      const { propertyId } = req.query;
      let events;
      
      if (propertyId && typeof propertyId === 'string') {
        events = await storage.getEventsByProperty(propertyId);
      } else {
        events = await storage.getAllEvents();
      }
      
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single event
  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(event);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update event
  app.patch("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.updateEvent(req.params.id, req.body);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(event);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete event
  app.delete("/api/events/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteEvent(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get events by property
  app.get("/api/events/property/:propertyId", async (req, res) => {
    try {
      const events = await storage.getEventsByProperty(req.params.propertyId);
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get events by status
  app.get("/api/events/status/:status", async (req, res) => {
    try {
      const events = await storage.getEventsByStatus(req.params.status);
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Add timeline entry to event
  app.post("/api/events/:id/timeline", async (req, res) => {
    try {
      const validatedEntry = insertEventTimelineSchema.parse({
        ...req.body,
        eventId: req.params.id,
      });
      const entry = await storage.addEventTimelineEntry(validatedEntry);
      res.json(entry);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get event timeline
  app.get("/api/events/:id/timeline", async (req, res) => {
    try {
      const timeline = await storage.getEventTimeline(req.params.id);
      res.json(timeline);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
