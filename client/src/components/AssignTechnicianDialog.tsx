import { useState, type ReactNode } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";
import { UserPlus } from "lucide-react";

interface AssignTechnicianDialogProps {
  incidentId: string;
  children?: ReactNode;
  onSuccess?: () => void;
}

export function AssignTechnicianDialog({ incidentId, children, onSuccess }: AssignTechnicianDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [technicianId, setTechnicianId] = useState("");
  const [reason, setReason] = useState("");

  // Fetch all users and filter to only technicians
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const technicians = users.filter(user => user.role === "technician");

  const assignMutation = useMutation({
    mutationFn: async () => {
      const selectedTechnician = technicians.find(t => t.id === technicianId);
      if (!selectedTechnician) {
        throw new Error("Technician not found");
      }

      const response = await apiRequest("PATCH", `/api/incidents/${incidentId}`, {
        status: "assigned",
        assignedTo: selectedTechnician.name,
      });
      const incident = await response.json();
      
      const reasonText = reason ? `: ${reason}` : '';
      await apiRequest("POST", `/api/incidents/${incidentId}/timeline`, {
        action: `Assigned to ${selectedTechnician.name}${reasonText}`,
        actor: "System",
      });
      
      return incident;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/incidents", incidentId, "timeline"] });
      toast({
        title: "Incident Assigned",
        description: "Technician has been notified",
      });
      setOpen(false);
      setTechnicianId("");
      setReason("");
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to assign incident",
        variant: "destructive",
      });
    },
  });

  const handleAssign = () => {
    if (!technicianId) {
      toast({
        title: "Technician Required",
        description: "Please select a technician to assign this incident to",
        variant: "destructive",
      });
      return;
    }
    assignMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="default" data-testid="button-assign">
            <UserPlus className="h-4 w-4 mr-2" />
            Assign to Technician
          </Button>
        )}
      </DialogTrigger>
      <DialogContent data-testid="dialog-assign-technician">
        <DialogHeader>
          <DialogTitle>Assign to Technician</DialogTitle>
          <DialogDescription>
            Assign this incident to a technician for resolution.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="technician">Technician *</Label>
            <Select
              value={technicianId}
              onValueChange={setTechnicianId}
            >
              <SelectTrigger data-testid="select-technician">
                <SelectValue placeholder="Select a technician..." />
              </SelectTrigger>
              <SelectContent>
                {technicians.length === 0 ? (
                  <SelectItem value="no-technicians" disabled>
                    No technicians available
                  </SelectItem>
                ) : (
                  technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assign-reason">Reason (Optional)</Label>
            <Textarea
              id="assign-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Best suited for this type of issue, Available now..."
              rows={2}
              data-testid="textarea-assign-reason"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            data-testid="button-cancel-dialog"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={assignMutation.isPending || !technicianId}
            data-testid="button-confirm-assign"
          >
            {assignMutation.isPending ? "Assigning..." : "Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
