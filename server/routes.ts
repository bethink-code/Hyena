import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertIncidentSchema, updateIncidentSchema, insertIncidentTimelineSchema, insertUserSchema, baseUserInsertSchema, insertOrganizationSchema, insertPropertySchema, insertHelpCommentSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import { put, list, del } from "@vercel/blob";

export async function registerRoutes(app: Express): Promise<Server> {
  // Helper function to strip password from user objects
  const sanitizeUser = (user: any) => {
    const { password, ...sanitized } = user;
    return sanitized;
  };

  // User routes
  app.get("/api/users", async (req, res) => {
    try {
      const { type, organizationId } = req.query;
      
      let users;
      if (type) {
        users = await storage.getUsersByType(type as string);
      } else if (organizationId) {
        users = await storage.getUsersByOrganization(organizationId as string);
      } else {
        users = await storage.getAllUsers();
      }
      
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
      
      // Enforce role/type separation
      const platformRoles = ['super_user', 'hyena_manager', 'hyena_user', 'technician'];
      const organizationRoles = ['regional_manager', 'property_manager'];
      
      if (validatedUser.userType === 'platform') {
        if (!platformRoles.includes(validatedUser.role)) {
          return res.status(400).json({ 
            error: 'Invalid role for platform user. Must be: super_user, hyena_manager, hyena_user, or technician' 
          });
        }
      } else if (validatedUser.userType === 'organization') {
        if (!organizationRoles.includes(validatedUser.role)) {
          return res.status(400).json({ 
            error: 'Invalid role for organization user. Must be: regional_manager or property_manager' 
          });
        }
        if (!validatedUser.organizationId) {
          return res.status(400).json({ 
            error: 'organizationId is required for organization users' 
          });
        }
      } else {
        return res.status(400).json({ 
          error: 'userType must be either "platform" or "organization"' 
        });
      }
      
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

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const updateSchema = baseUserInsertSchema.partial().omit({ password: true });
      const validatedData = updateSchema.parse(req.body);
      
      // Get existing user to check constraints
      const existingUser = await storage.getUser(req.params.id);
      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Enforce role/type separation if either is being updated
      const platformRoles = ['super_user', 'hyena_manager', 'hyena_user', 'technician'];
      const organizationRoles = ['regional_manager', 'property_manager'];
      
      const finalUserType = validatedData.userType ?? existingUser.userType;
      const finalRole = validatedData.role ?? existingUser.role;
      
      if (finalUserType === 'platform') {
        if (!platformRoles.includes(finalRole)) {
          return res.status(400).json({ 
            error: 'Invalid role for platform user. Must be: super_user, hyena_manager, hyena_user, or technician' 
          });
        }
      } else if (finalUserType === 'organization') {
        if (!organizationRoles.includes(finalRole)) {
          return res.status(400).json({ 
            error: 'Invalid role for organization user. Must be: regional_manager or property_manager' 
          });
        }
        const finalOrgId = validatedData.organizationId ?? existingUser.organizationId;
        if (!finalOrgId) {
          return res.status(400).json({ 
            error: 'organizationId is required for organization users' 
          });
        }
      }
      
      const user = await storage.updateUser(req.params.id, validatedData);
      
      res.json(sanitizeUser(user!));
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: 'Invalid user data', details: error.errors });
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
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Organization routes
  app.get("/api/organizations", async (req, res) => {
    try {
      const organizations = await storage.getAllOrganizations();
      res.json(organizations);
    } catch (error: any) {
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
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/organizations/:id", async (req, res) => {
    try {
      const updateSchema = z.object({
        name: z.string().optional(),
        active: z.boolean().optional(),
        theme: z.enum(['table_mountain_blue', 'kalahari_gold', 'sunset_yellow', 'jacaranda_purple', 'protea_red'] as const).optional(),
        logoUrl: z.string().nullable().optional(),
        contactEmail: z.string().email().nullable().optional(),
        contactPhone: z.string().nullable().optional(),
        contactPerson: z.string().nullable().optional(),
        headquarters: z.string().nullable().optional(),
        timezone: z.string().optional(),
        language: z.string().optional(),
      });
      
      const validatedData = updateSchema.parse(req.body);
      
      // If setting this organization to active, deactivate all others first (exclusive selection)
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
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: 'Invalid organization data', details: error.errors });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  // Logo upload handling — stores to Vercel Blob
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5242880 }, // 5MB
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif|svg|webp/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      if (extname && mimetype) {
        cb(null, true);
      } else {
        cb(new Error("Only image files are allowed"));
      }
    },
  });

  // Logo file upload endpoint
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
        contentType: req.file.mimetype,
      });

      const organization = await storage.updateOrganization(orgId, {
        logoUrl: blob.url,
      });

      if (!organization) {
        await del(blob.url).catch(() => {});
        return res.status(404).json({ error: "Organization not found" });
      }

      res.json({ logoUrl: blob.url, organization });
    } catch (error: any) {
      console.error("Error uploading logo:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Logo URL update endpoint
  app.patch("/api/organizations/:id/logo", async (req, res) => {
    try {
      if (!req.body.logoUrl) {
        return res.status(400).json({ error: "logoUrl is required" });
      }

      const organization = await storage.updateOrganization(req.params.id, {
        logoUrl: req.body.logoUrl,
      });

      if (!organization) {
        return res.status(404).json({ error: "Organization not found" });
      }

      res.json(organization);
    } catch (error: any) {
      console.error("Error updating organization logo:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Platform logo upload endpoint
  app.post("/api/platform/upload-logo", upload.single("logo"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Remove any existing platform logo(s) so only the latest remains
      const existing = await list({ prefix: "platform/" });
      await Promise.all(existing.blobs.map((b) => del(b.url)));

      const ext = path.extname(req.file.originalname);
      const blob = await put(`platform/logo-${Date.now()}${ext}`, req.file.buffer, {
        access: "public",
        contentType: req.file.mimetype,
      });

      res.json({ logoUrl: blob.url });
    } catch (error: any) {
      console.error("Error uploading platform logo:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get platform logo
  app.get("/api/platform/logo", async (req, res) => {
    try {
      const result = await list({ prefix: "platform/" });
      const blob = result.blobs[0];
      res.json({ logoUrl: blob?.url ?? null });
    } catch (error: any) {
      console.error("Error getting platform logo:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Property routes
  app.get("/api/properties", async (req, res) => {
    try {
      const properties = await storage.getAllProperties();
      res.json(properties);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/organizations/:id/properties", async (req, res) => {
    try {
      const properties = await storage.getPropertiesByOrganization(req.params.id);
      res.json(properties);
    } catch (error: any) {
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
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/organizations/:id/properties", async (req, res) => {
    try {
      const validatedProperty = insertPropertySchema.parse({
        ...req.body,
        organizationId: req.params.id,
      });
      const property = await storage.createProperty(validatedProperty);
      res.json(property);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: 'Invalid property data', details: error.errors });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  app.patch("/api/properties/:id", async (req, res) => {
    try {
      const updateSchema = z.object({
        name: z.string().optional(),
        location: z.string().optional(),
        address: z.string().nullable().optional(),
        status: z.enum(['active', 'inactive', 'maintenance'] as const).optional(),
        timezone: z.string().optional(),
      });
      
      const validatedData = updateSchema.parse(req.body);
      const property = await storage.updateProperty(req.params.id, validatedData);
      
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }
      
      res.json(property);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: 'Invalid property data', details: error.errors });
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
    } catch (error: any) {
      res.status(500).json({ error: error.message });
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

  // Add comment to incident (creates a timeline entry)
  app.post("/api/incidents/:id/comments", async (req, res) => {
    try {
      const { comment } = req.body;
      if (!comment || typeof comment !== 'string' || !comment.trim()) {
        return res.status(400).json({ error: "Comment text is required" });
      }

      // Get current user from session (or use a default)
      const actor = (req as any).user?.username || (req as any).user?.email || "User";

      const validatedEntry = insertIncidentTimelineSchema.parse({
        incidentId: req.params.id,
        action: comment.trim(),
        actor,
        actionType: "comment",
      });

      const entry = await storage.addIncidentTimelineEntry(validatedEntry);
      res.json(entry);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Event routes (alias for incidents - system uses terms interchangeably)
  // Uses shared handler to maintain full feature parity with /api/incidents
  app.get("/api/events", getIncidentsHandler);

  // Help comment routes for documentation panel feedback
  app.get("/api/help/comments/:route", async (req, res) => {
    try {
      const route = decodeURIComponent(req.params.route);
      const comments = await storage.getHelpCommentsByRoute(route);
      res.json(comments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/help/comments", async (req, res) => {
    try {
      const validatedComment = insertHelpCommentSchema.parse(req.body);
      const comment = await storage.createHelpComment(validatedComment);
      res.json(comment);
    } catch (error: any) {
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
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Report API endpoints
  
  // Manager Reports
  app.get("/api/reports/incidents", async (req, res) => {
    try {
      const allIncidents = await storage.getAllIncidents();
      
      // Calculate additional metrics for each incident
      const incidentsWithMetrics = allIncidents.map(incident => {
        const createdDate = new Date(incident.createdAt);
        const updatedDate = new Date(incident.updatedAt);
        const resolutionTime = updatedDate.getTime() - createdDate.getTime();
        const resolutionHours = Math.round(resolutionTime / (1000 * 60 * 60));
        
        return {
          ...incident,
          resolutionHours,
          isOverdue: incident.status !== 'resolved' && resolutionHours > 24,
        };
      });
      
      res.json(incidentsWithMetrics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/reports/sla-performance", async (req, res) => {
    try {
      const allIncidents = await storage.getAllIncidents();
      
      // Calculate SLA metrics for each incident
      const slaData = allIncidents.map(incident => {
        const createdDate = new Date(incident.createdAt);
        const updatedDate = new Date(incident.updatedAt);
        const resolutionTime = updatedDate.getTime() - createdDate.getTime();
        const resolutionHours = Math.round(resolutionTime / (1000 * 60 * 60));
        
        // Define SLA targets based on priority
        const slaTargets: Record<string, number> = {
          critical: 4,
          high: 8,
          medium: 24,
          low: 48,
        };
        
        const slaTarget = slaTargets[incident.priority] || 24;
        const slaStatus = incident.status === 'resolved' 
          ? (resolutionHours <= slaTarget ? 'met' : 'breached')
          : (resolutionHours > slaTarget ? 'at_risk' : 'on_track');
        
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
          slaBreachBy: slaStatus === 'breached' ? resolutionHours - slaTarget : 0,
        };
      });
      
      res.json(slaData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/reports/category-analysis", async (req, res) => {
    try {
      const allIncidents = await storage.getAllIncidents();
      
      // Group incidents by category
      const categoryGroups = allIncidents.reduce((acc, incident) => {
        const category = incident.category || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(incident);
        return acc;
      }, {} as Record<string, typeof allIncidents>);
      
      // Calculate metrics for each category
      const categoryData = Object.entries(categoryGroups).map(([category, incidents]) => {
        const totalIncidents = incidents.length;
        const resolvedIncidents = incidents.filter(i => i.status === 'resolved').length;
        const criticalIncidents = incidents.filter(i => i.priority === 'critical').length;
        const avgResolutionTime = incidents
          .filter(i => i.status === 'resolved')
          .reduce((sum, i) => {
            const time = new Date(i.updatedAt).getTime() - new Date(i.createdAt).getTime();
            return sum + (time / (1000 * 60 * 60));
          }, 0) / (resolvedIncidents || 1);
        
        return {
          category,
          totalIncidents,
          resolvedIncidents,
          criticalIncidents,
          avgResolutionTime: Math.round(avgResolutionTime),
          resolutionRate: Math.round((resolvedIncidents / totalIncidents) * 100),
        };
      });
      
      res.json(categoryData.sort((a, b) => b.totalIncidents - a.totalIncidents));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/reports/guest-impact", async (req, res) => {
    try {
      const allIncidents = await storage.getAllIncidents();
      
      // Filter incidents that affect guests
      const guestImpactData = allIncidents
        .filter(incident => incident.affectedGuests && incident.affectedGuests > 0)
        .map(incident => {
          const createdDate = new Date(incident.createdAt);
          const updatedDate = new Date(incident.updatedAt);
          const resolutionTime = updatedDate.getTime() - createdDate.getTime();
          const resolutionHours = Math.round(resolutionTime / (1000 * 60 * 60));
          
          // Calculate impact score (guests * hours)
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
            category: incident.category,
          };
        })
        .sort((a, b) => b.impactScore - a.impactScore);
      
      res.json(guestImpactData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/reports/user-feedback", async (req, res) => {
    try {
      // Fetch all help comments from all routes
      const allComments = await storage.getAllHelpComments();
      res.json(allComments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
