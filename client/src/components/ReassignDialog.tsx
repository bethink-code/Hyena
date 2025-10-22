import { useState } from "react";
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
import { UserCog } from "lucide-react";

interface ReassignDialogProps {
  incidentId: string;
  currentAssignee?: string;
  children?: React.ReactNode;
  onSuccess?: () => void;
}

export function ReassignDialog({ incidentId, currentAssignee, children, onSuccess }: ReassignDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [newAssignee, setNewAssignee] = useState("");
  const [reason, setReason] = useState("");

  // Fetch all users and filter to only technicians
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const technicians = users.filter(user => user.role === "technician");

  const reassignMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PATCH", `/api/incidents/${incidentId}`, {
        assignedTo: newAssignee,
      });
      const incident = await response.json();
      
      const fromText = currentAssignee ? `from ${currentAssignee} ` : '';
      const reasonText = reason ? `: ${reason}` : '';
      await apiRequest("POST", `/api/incidents/${incidentId}/timeline`, {
        action: `Reassigned ${fromText}to ${newAssignee}${reasonText}`,
        actor: "System",
      });
      
      return incident;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/incidents", incidentId, "timeline"] });
      toast({
        title: "Incident Reassigned",
        description: `Incident assigned to ${newAssignee}`,
      });
      setOpen(false);
      setNewAssignee("");
      setReason("");
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reassign incident",
        variant: "destructive",
      });
    },
  });

  const handleReassign = () => {
    if (!newAssignee.trim()) {
      toast({
        title: "Assignee Required",
        description: "Please specify who to assign this incident to",
        variant: "destructive",
      });
      return;
    }
    reassignMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" data-testid="button-reassign">
            <UserCog className="h-4 w-4 mr-2" />
            Reassign
          </Button>
        )}
      </DialogTrigger>
      <DialogContent data-testid="dialog-reassign">
        <DialogHeader>
          <DialogTitle>Reassign Incident</DialogTitle>
          <DialogDescription>
            Transfer this incident to another technician or team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {currentAssignee && (
            <div className="text-sm text-muted-foreground">
              Currently assigned to: <span className="font-medium">{currentAssignee}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="new-assignee">Assign To *</Label>
            <Select
              value={newAssignee}
              onValueChange={setNewAssignee}
            >
              <SelectTrigger data-testid="select-new-assignee">
                <SelectValue placeholder="Select a technician..." />
              </SelectTrigger>
              <SelectContent>
                {technicians.length === 0 ? (
                  <SelectItem value="no-technicians" disabled>
                    No technicians available
                  </SelectItem>
                ) : (
                  technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.name}>
                      {tech.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reassign-reason">Reason (Optional)</Label>
            <Textarea
              id="reassign-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Requires specialist knowledge, Load balancing..."
              rows={2}
              data-testid="textarea-reassign-reason"
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
            onClick={handleReassign}
            disabled={reassignMutation.isPending || !newAssignee.trim()}
            data-testid="button-confirm-reassign"
          >
            {reassignMutation.isPending ? "Reassigning..." : "Reassign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
