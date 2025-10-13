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
import { EVENT_CATEGORY_OPTIONS, EVENT_CATEGORIES } from "@shared/eventCategories";
import { Wrench, Loader2 } from "lucide-react";
import type { InsertIncident } from "@shared/schema";

interface LogIssueDialogProps {
  defaultPropertyId?: string;
  children?: React.ReactNode;
}

export function LogIssueDialog({ defaultPropertyId, children }: LogIssueDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    category: "",
    location: "",
    propertyId: defaultPropertyId || PROPERTIES[0].id,
  });

  const createIncidentMutation = useMutation({
    mutationFn: async (data: InsertIncident) => {
      const response = await apiRequest("POST", "/api/incidents", data);
      const incident = await response.json();
      
      await apiRequest("POST", `/api/incidents/${incident.id}/timeline`, {
        action: "Issue logged by field technician",
        actor: "Technician App",
      });
      
      return incident;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      toast({
        title: "Issue Logged",
        description: "The issue has been added to the system",
      });
      setOpen(false);
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        category: "",
        location: "",
        propertyId: defaultPropertyId || PROPERTIES[0].id,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Log Issue",
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

    const incidentData: InsertIncident = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: "new",
      category: formData.category,
      location: formData.location || undefined,
      propertyId: formData.propertyId,
      source: "technician_report",
      incidentType: formData.category === EVENT_CATEGORIES.PLANNED_MAINTENANCE || 
                 formData.category === EVENT_CATEGORIES.EQUIPMENT_MAINTENANCE
                 ? "proactive" : "reactive",
    };

    createIncidentMutation.mutate(incidentData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button data-testid="button-log-issue">
            <Wrench className="h-4 w-4 mr-2" />
            Log Issue
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-log-issue">
        <DialogHeader>
          <DialogTitle>Log a New Issue</DialogTitle>
          <DialogDescription>
            Report a technical issue or maintenance item you've encountered
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="property">Property *</Label>
            <Select
              value={formData.propertyId}
              onValueChange={(value) => setFormData({ ...formData, propertyId: value })}
            >
              <SelectTrigger id="property" data-testid="select-property">
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTIES.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name} - {property.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger id="category" data-testid="select-category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.icon && <span className="mr-2">{option.icon}</span>}
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Issue Title *</Label>
            <Input
              id="title"
              placeholder="Brief description of the issue"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              data-testid="input-title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description *</Label>
            <Textarea
              id="description"
              placeholder="Provide details about what you observed, steps taken, etc."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              data-testid="textarea-description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., Room 305, Lobby, Server Room"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              data-testid="input-location"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData({ ...formData, priority: value })}
            >
              <SelectTrigger id="priority" data-testid="select-priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createIncidentMutation.isPending}
              data-testid="button-submit"
            >
              {createIncidentMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Log Issue
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
