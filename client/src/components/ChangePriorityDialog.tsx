import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
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
import { AlertCircle } from "lucide-react";

interface ChangePriorityDialogProps {
  incidentId: string;
  currentPriority: string;
  children?: React.ReactNode;
  onSuccess?: () => void;
}

export function ChangePriorityDialog({ incidentId, currentPriority, children, onSuccess }: ChangePriorityDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [newPriority, setNewPriority] = useState(currentPriority);
  const [reason, setReason] = useState("");

  const priorityRank = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
  };

  const changePriorityMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PATCH", `/api/incidents/${incidentId}`, {
        priority: newPriority,
      });
      const incident = await response.json();
      
      const currentRank = priorityRank[currentPriority as keyof typeof priorityRank] || 0;
      const newRank = priorityRank[newPriority as keyof typeof priorityRank] || 0;
      
      const action = newRank > currentRank 
        ? `Priority escalated from ${currentPriority} to ${newPriority}`
        : newRank < currentRank
        ? `Priority de-escalated from ${currentPriority} to ${newPriority}`
        : `Priority changed from ${currentPriority} to ${newPriority}`;
      
      await apiRequest("POST", `/api/incidents/${incidentId}/timeline`, {
        action: reason ? `${action}: ${reason}` : action,
        actor: "System",
      });
      
      return incident;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/incidents", incidentId, "timeline"] });
      toast({
        title: "Priority Updated",
        description: `Incident priority changed to ${newPriority}`,
      });
      setOpen(false);
      setReason("");
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to change priority",
        variant: "destructive",
      });
    },
  });

  const handleChangePriority = () => {
    if (newPriority === currentPriority) {
      toast({
        title: "No Change",
        description: "Please select a different priority level",
        variant: "destructive",
      });
      return;
    }
    changePriorityMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" data-testid="button-change-priority">
            <AlertCircle className="h-4 w-4 mr-2" />
            Change Priority
          </Button>
        )}
      </DialogTrigger>
      <DialogContent data-testid="dialog-change-priority">
        <DialogHeader>
          <DialogTitle>Change Incident Priority</DialogTitle>
          <DialogDescription>
            Adjust the priority level based on severity and business impact.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Current priority: <span className="font-medium capitalize">{currentPriority}</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-priority">New Priority *</Label>
            <Select value={newPriority} onValueChange={setNewPriority}>
              <SelectTrigger id="new-priority" data-testid="select-new-priority">
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
            <Label htmlFor="priority-reason">Reason (Optional)</Label>
            <Textarea
              id="priority-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., More guests affected than initially reported, Issue escalating..."
              rows={2}
              data-testid="textarea-priority-reason"
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
            onClick={handleChangePriority}
            disabled={changePriorityMutation.isPending || newPriority === currentPriority}
            data-testid="button-confirm-change-priority"
          >
            {changePriorityMutation.isPending ? "Updating..." : "Update Priority"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
