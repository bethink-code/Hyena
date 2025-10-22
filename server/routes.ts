import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertIncidentSchema, updateIncidentSchema, insertIncidentTimelineSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Helper function to strip password from user objects
  const sanitizeUser = (user: any) => {
    const { password, ...sanitized } = user;
    return sanitized;
  };

  // User routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove password field from all user objects
      const sanitizedUsers = users.map(sanitizeUser);
      res.json(sanitizedUsers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const validatedUser = insertUserSchema.parse(req.body);
      
      // Hash the password before storing
      const hashedPassword = await bcrypt.hash(validatedUser.password, 10);
      
      const user = await storage.createUser({
        ...validatedUser,
        password: hashedPassword,
      });
      
      // Remove password field from response
      res.json(sanitizeUser(user));
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: 'Invalid user data', details: error.errors });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  // Incident routes
  
  // Query parameter schema for incident filtering
  const incidentQuerySchema = z.object({
    propertyId: z.string().optional(),
    status: z.string().optional(),
  });
  
  // Shared handler for getting incidents (used by both /api/incidents and /api/events)
  const getIncidentsHandler = async (req: any, res: any) => {
    try {
      // Validate query parameters
      const { propertyId, status } = incidentQuerySchema.parse(req.query);
      let incidents;
      
      // Get incidents based on filters (supports both individually or combined)
      if (propertyId) {
        incidents = await storage.getIncidentsByProperty(propertyId);
        // Apply status filter to property-filtered results if both provided
        if (status && incidents) {
          incidents = incidents.filter(incident => incident.status === status);
        }
      } else if (status) {
        incidents = await storage.getIncidentsByStatus(status);
      } else {
        incidents = await storage.getAllIncidents();
      }
      
      res.json(incidents);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: 'Invalid query parameters', details: error.errors });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  };
  
  // Create a new incident
  app.post("/api/incidents", async (req, res) => {
    try {
      const validatedIncident = insertIncidentSchema.parse(req.body);
      const incident = await storage.createIncident(validatedIncident);
      
      // Add initial timeline entry
      await storage.addIncidentTimelineEntry({
        incidentId: incident.id,
        action: `Incident created from ${incident.source || 'unknown source'}`,
        actor: incident.source === 'guest_portal' ? 'Guest Portal' : 'System',
      });
      
      res.json(incident);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get all incidents (with optional propertyId or status filter)
  app.get("/api/incidents", getIncidentsHandler);

  // Get single incident
  app.get("/api/incidents/:id", async (req, res) => {
    try {
      const incident = await storage.getIncident(req.params.id);
      if (!incident) {
        return res.status(404).json({ error: "Incident not found" });
      }
      res.json(incident);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update incident
  app.patch("/api/incidents/:id", async (req, res) => {
    try {
      const validatedUpdate = updateIncidentSchema.parse(req.body);
      
      // Normalize timestamp fields: convert ISO strings to Date objects
      const normalizedUpdate = {
        ...validatedUpdate,
        ...(validatedUpdate.holdResumeDate && typeof validatedUpdate.holdResumeDate === 'string' 
          ? { holdResumeDate: new Date(validatedUpdate.holdResumeDate) }
          : {}),
        ...(validatedUpdate.scheduledFor && typeof validatedUpdate.scheduledFor === 'string'
          ? { scheduledFor: new Date(validatedUpdate.scheduledFor) }
          : {}),
      };
      
      const incident = await storage.updateIncident(req.params.id, normalizedUpdate);
      if (!incident) {
        return res.status(404).json({ error: "Incident not found" });
      }
      res.json(incident);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: 'Invalid update data', details: error.errors });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  // Delete incident
  app.delete("/api/incidents/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteIncident(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Incident not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get incidents by property
  app.get("/api/incidents/property/:propertyId", async (req, res) => {
    try {
      const incidents = await storage.getIncidentsByProperty(req.params.propertyId);
      res.json(incidents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get incidents by status
  app.get("/api/incidents/status/:status", async (req, res) => {
    try {
      const incidents = await storage.getIncidentsByStatus(req.params.status);
      res.json(incidents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Add timeline entry to incident
  app.post("/api/incidents/:id/timeline", async (req, res) => {
    try {
      const validatedEntry = insertIncidentTimelineSchema.parse({
        ...req.body,
        incidentId: req.params.id,
      });
      const entry = await storage.addIncidentTimelineEntry(validatedEntry);
      res.json(entry);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get incident timeline
  app.get("/api/incidents/:id/timeline", async (req, res) => {
    try {
      const timeline = await storage.getIncidentTimeline(req.params.id);
      res.json(timeline);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Event routes (alias for incidents - system uses terms interchangeably)
  // Uses shared handler to maintain full feature parity with /api/incidents
  app.get("/api/events", getIncidentsHandler);

  const httpServer = createServer(app);

  return httpServer;
}
