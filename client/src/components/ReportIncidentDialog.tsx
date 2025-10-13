import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PROPERTIES } from "@/lib/properties";
import { EVENT_CATEGORY_OPTIONS, EVENT_CATEGORIES, LOAD_SHEDDING_STAGES, SA_ISP_PROVIDERS, WEATHER_EVENT_TYPES } from "@shared/eventCategories";
import { AlertTriangle, Loader2, Calendar } from "lucide-react";
import type { InsertIncident } from "@shared/schema";

interface ReportIncidentDialogProps {
  defaultPropertyId?: string;
  children?: React.ReactNode;
}

export function ReportIncidentDialog({ defaultPropertyId, children }: ReportIncidentDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    category: "",
    location: "",
    affectedGuests: "",
    estimatedResolution: "",
    propertyId: defaultPropertyId || PROPERTIES[0].id,
    scheduledFor: "",
    loadSheddingStage: "",
    ispProvider: "",
    weatherType: "",
  });

  const createIncidentMutation = useMutation({
    mutationFn: async (data: InsertIncident) => {
      const response = await apiRequest("POST", "/api/incidents", data);
      const incident = await response.json();
      
      await apiRequest("POST", `/api/incidents/${incident.id}/timeline`, {
        action: "Incident reported by manager",
        actor: "Manager Dashboard",
      });
      
      return incident;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      toast({
        title: "Incident Reported",
        description: "The incident has been logged and is now in the queue",
      });
      setOpen(false);
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        category: "",
        location: "",
        affectedGuests: "",
        estimatedResolution: "",
        propertyId: defaultPropertyId || PROPERTIES[0].id,
        scheduledFor: "",
        loadSheddingStage: "",
        ispProvider: "",
        weatherType: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Report Incident",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const incidentType = formData.category === EVENT_CATEGORIES.PLANNED_MAINTENANCE || 
                 formData.category === EVENT_CATEGORIES.HIGH_TRAFFIC_EVENT 
                 ? "proactive" 
                 : formData.category === EVENT_CATEGORIES.LOAD_SHEDDING ||
                   formData.category === EVENT_CATEGORIES.WEATHER_IMPACT ||
                   formData.category === EVENT_CATEGORIES.ISP_OUTAGE
                 ? "environmental"
                 : "reactive";

    const metadata: Record<string, string> = {};
    if (formData.loadSheddingStage) metadata.loadSheddingStage = formData.loadSheddingStage;
    if (formData.ispProvider) metadata.ispProvider = formData.ispProvider;
    if (formData.weatherType) metadata.weatherType = formData.weatherType;

    const incidentData: InsertIncident = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: "new",
      category: formData.category,
      location: formData.location || undefined,
      affectedGuests: formData.affectedGuests ? parseInt(formData.affectedGuests) : undefined,
      estimatedResolution: formData.estimatedResolution || undefined,
      propertyId: formData.propertyId,
      source: "manager_report",
      incidentType,
      scheduledFor: formData.scheduledFor ? (formData.scheduledFor as any) : undefined,
      metadata: Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : undefined,
    };

    createIncidentMutation.mutate(incidentData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button data-testid="button-report-incident">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Report Incident
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report Network Incident</DialogTitle>
          <DialogDescription>
            Log incidents observed by staff, reported by guests at the front desk, or any issues not automatically detected
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="incident-title">Incident Title *</Label>
              <Input
                id="incident-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Wi-Fi Down in Conference Hall"
                required
                data-testid="input-incident-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="incident-property">Property *</Label>
              <Select
                value={formData.propertyId}
                onValueChange={(value) => setFormData({ ...formData, propertyId: value })}
              >
                <SelectTrigger id="incident-property" data-testid="select-incident-property">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTIES.map(property => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="incident-category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="incident-category" data-testid="select-incident-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EVENT_CATEGORIES.NETWORK_CONNECTIVITY}>
                    {EVENT_CATEGORIES.NETWORK_CONNECTIVITY}
                  </SelectItem>
                  <SelectItem value={EVENT_CATEGORIES.PERFORMANCE}>
                    {EVENT_CATEGORIES.PERFORMANCE}
                  </SelectItem>
                  <SelectItem value={EVENT_CATEGORIES.LOAD_SHEDDING}>
                    {EVENT_CATEGORIES.LOAD_SHEDDING} (SA)
                  </SelectItem>
                  <SelectItem value={EVENT_CATEGORIES.ISP_OUTAGE}>
                    {EVENT_CATEGORIES.ISP_OUTAGE} (SA)
                  </SelectItem>
                  <SelectItem value={EVENT_CATEGORIES.WEATHER_IMPACT}>
                    {EVENT_CATEGORIES.WEATHER_IMPACT} (SA)
                  </SelectItem>
                  <SelectItem value={EVENT_CATEGORIES.GUEST_EXPERIENCE}>
                    {EVENT_CATEGORIES.GUEST_EXPERIENCE}
                  </SelectItem>
                  <SelectItem value={EVENT_CATEGORIES.PLANNED_MAINTENANCE}>
                    {EVENT_CATEGORIES.PLANNED_MAINTENANCE}
                  </SelectItem>
                  <SelectItem value={EVENT_CATEGORIES.HIGH_TRAFFIC_EVENT}>
                    {EVENT_CATEGORIES.HIGH_TRAFFIC_EVENT}
                  </SelectItem>
                  <SelectItem value={EVENT_CATEGORIES.HARDWARE_FAILURE}>
                    {EVENT_CATEGORIES.HARDWARE_FAILURE}
                  </SelectItem>
                  <SelectItem value={EVENT_CATEGORIES.BANDWIDTH}>
                    {EVENT_CATEGORIES.BANDWIDTH}
                  </SelectItem>
                  <SelectItem value={EVENT_CATEGORIES.SECURITY}>
                    {EVENT_CATEGORIES.SECURITY}
                  </SelectItem>
                  <SelectItem value={EVENT_CATEGORIES.CONFIGURATION}>
                    {EVENT_CATEGORIES.CONFIGURATION}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="incident-priority">Priority *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger id="incident-priority" data-testid="select-incident-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="incident-location">Location</Label>
              <Input
                id="incident-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Conference Hall A, Room 305"
                data-testid="input-incident-location"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="incident-guests">Affected Guests</Label>
              <Input
                id="incident-guests"
                type="number"
                min="0"
                value={formData.affectedGuests}
                onChange={(e) => setFormData({ ...formData, affectedGuests: e.target.value })}
                placeholder="Number of guests affected"
                data-testid="input-incident-guests"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="incident-description">Description *</Label>
            <Textarea
              id="incident-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the incident in detail. What is happening? When did it start? Any patterns observed?"
              rows={4}
              required
              data-testid="input-incident-description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="incident-resolution">Estimated Resolution Time</Label>
            <Input
              id="incident-resolution"
              value={formData.estimatedResolution}
              onChange={(e) => setFormData({ ...formData, estimatedResolution: e.target.value })}
              placeholder="e.g., 30 minutes, 2 hours"
              data-testid="input-incident-resolution"
            />
          </div>

          {/* SA-Specific & Proactive Event Fields */}
          {formData.category === EVENT_CATEGORIES.LOAD_SHEDDING && (
            <div className="space-y-2">
              <Label htmlFor="load-shedding-stage">Load Shedding Stage</Label>
              <Select
                value={formData.loadSheddingStage}
                onValueChange={(value) => setFormData({ ...formData, loadSheddingStage: value })}
              >
                <SelectTrigger id="load-shedding-stage" data-testid="select-load-shedding-stage">
                  <SelectValue placeholder="Select Eskom stage" />
                </SelectTrigger>
                <SelectContent>
                  {LOAD_SHEDDING_STAGES.map((stage) => (
                    <SelectItem key={stage.value} value={stage.value}>
                      {stage.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.category === EVENT_CATEGORIES.ISP_OUTAGE && (
            <div className="space-y-2">
              <Label htmlFor="isp-provider">ISP Provider</Label>
              <Select
                value={formData.ispProvider}
                onValueChange={(value) => setFormData({ ...formData, ispProvider: value })}
              >
                <SelectTrigger id="isp-provider" data-testid="select-isp-provider">
                  <SelectValue placeholder="Select ISP" />
                </SelectTrigger>
                <SelectContent>
                  {SA_ISP_PROVIDERS.map((isp) => (
                    <SelectItem key={isp} value={isp}>
                      {isp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.category === EVENT_CATEGORIES.WEATHER_IMPACT && (
            <div className="space-y-2">
              <Label htmlFor="weather-type">Weather Event Type</Label>
              <Select
                value={formData.weatherType}
                onValueChange={(value) => setFormData({ ...formData, weatherType: value })}
              >
                <SelectTrigger id="weather-type" data-testid="select-weather-type">
                  <SelectValue placeholder="Select weather event" />
                </SelectTrigger>
                <SelectContent>
                  {WEATHER_EVENT_TYPES.map((weather) => (
                    <SelectItem key={weather} value={weather}>
                      {weather}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(formData.category === EVENT_CATEGORIES.PLANNED_MAINTENANCE || 
            formData.category === EVENT_CATEGORIES.HIGH_TRAFFIC_EVENT) && (
            <div className="space-y-2">
              <Label htmlFor="scheduled-for">Scheduled Date & Time</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="scheduled-for"
                  type="datetime-local"
                  value={formData.scheduledFor}
                  onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                  className="pl-10"
                  data-testid="input-scheduled-for"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              data-testid="button-cancel-incident"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createIncidentMutation.isPending}
              data-testid="button-submit-incident"
            >
              {createIncidentMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Reporting...
                </>
              ) : (
                "Report Incident"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
