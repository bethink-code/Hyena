import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertIncidentSchema, insertIncidentTimelineSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Incident routes
  
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

  // Get all incidents (with optional propertyId filter)
  app.get("/api/incidents", async (req, res) => {
    try {
      const { propertyId } = req.query;
      let incidents;
      
      if (propertyId && typeof propertyId === 'string') {
        incidents = await storage.getIncidentsByProperty(propertyId);
      } else {
        incidents = await storage.getAllIncidents();
      }
      
      res.json(incidents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

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
      const incident = await storage.updateIncident(req.params.id, req.body);
      if (!incident) {
        return res.status(404).json({ error: "Incident not found" });
      }
      res.json(incident);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
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

  const httpServer = createServer(app);

  return httpServer;
}
