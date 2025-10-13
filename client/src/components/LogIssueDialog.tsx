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
import type { InsertEvent } from "@shared/schema";

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

  const createEventMutation = useMutation({
    mutationFn: async (data: InsertEvent) => {
      const response = await apiRequest("POST", "/api/events", data);
      const event = await response.json();
      
      await apiRequest("POST", `/api/events/${event.id}/timeline`, {
        action: "Issue logged by field technician",
        actor: "Technician App",
      });
      
      return event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
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

    const eventData: InsertEvent = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: "new",
      category: formData.category,
      location: formData.location || undefined,
      propertyId: formData.propertyId,
      source: "technician_report",
      eventType: formData.category === EVENT_CATEGORIES.PLANNED_MAINTENANCE || 
                 formData.category === EVENT_CATEGORIES.EQUIPMENT_MAINTENANCE
                 ? "proactive" 
                 : "reactive",
    };

    createEventMutation.mutate(eventData);
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
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Field Issue</DialogTitle>
          <DialogDescription>
            Quickly report issues discovered on-site during inspections or service calls
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="issue-title">Issue Title *</Label>
            <Input
              id="issue-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Access Point Not Responding"
              required
              data-testid="input-issue-title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issue-property">Property *</Label>
              <Select
                value={formData.propertyId}
                onValueChange={(value) => setFormData({ ...formData, propertyId: value })}
              >
                <SelectTrigger id="issue-property" data-testid="select-issue-property">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTIES.filter(p => ["1", "2", "3"].includes(p.id)).map(property => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue-location">Location *</Label>
              <Input
                id="issue-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Room 305, Lobby"
                required
                data-testid="input-issue-location"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="issue-category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger id="issue-category" data-testid="select-issue-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={EVENT_CATEGORIES.HARDWARE_FAILURE}>
                  {EVENT_CATEGORIES.HARDWARE_FAILURE}
                </SelectItem>
                <SelectItem value={EVENT_CATEGORIES.NETWORK_CONNECTIVITY}>
                  {EVENT_CATEGORIES.NETWORK_CONNECTIVITY}
                </SelectItem>
                <SelectItem value={EVENT_CATEGORIES.CONFIGURATION}>
                  {EVENT_CATEGORIES.CONFIGURATION}
                </SelectItem>
                <SelectItem value={EVENT_CATEGORIES.PERFORMANCE}>
                  {EVENT_CATEGORIES.PERFORMANCE}
                </SelectItem>
                <SelectItem value={EVENT_CATEGORIES.EQUIPMENT_MAINTENANCE}>
                  {EVENT_CATEGORIES.EQUIPMENT_MAINTENANCE}
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
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="issue-priority">Priority *</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData({ ...formData, priority: value })}
            >
              <SelectTrigger id="issue-priority" data-testid="select-issue-priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Can wait for scheduled maintenance</SelectItem>
                <SelectItem value="medium">Medium - Should address soon</SelectItem>
                <SelectItem value="high">High - Affecting guests/services</SelectItem>
                <SelectItem value="critical">Critical - Immediate attention required</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="issue-description">Description *</Label>
            <Textarea
              id="issue-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What's wrong? What did you observe? Any error messages or symptoms?"
              rows={4}
              required
              data-testid="input-issue-description"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              data-testid="button-cancel-issue"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createEventMutation.isPending}
              data-testid="button-submit-issue"
            >
              {createEventMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Logging...
                </>
              ) : (
                "Log Issue"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
