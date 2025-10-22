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
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { XCircle } from "lucide-react";

interface CancelIncidentDialogProps {
  incidentId: string;
  children?: React.ReactNode;
  onSuccess?: () => void;
}

export function CancelIncidentDialog({ incidentId, children, onSuccess }: CancelIncidentDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PATCH", `/api/incidents/${incidentId}`, {
        status: "cancelled",
        cancelReason,
      });
      const incident = await response.json();
      
      await apiRequest("POST", `/api/incidents/${incidentId}/timeline`, {
        action: `Incident cancelled: ${cancelReason}`,
        actor: "System",
      });
      
      return incident;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/incidents", incidentId, "timeline"] });
      toast({
        title: "Incident Cancelled",
        description: "The incident has been cancelled",
      });
      setOpen(false);
      setCancelReason("");
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to cancel incident",
        variant: "destructive",
      });
    },
  });

  const handleCancel = () => {
    if (!cancelReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for cancellation",
        variant: "destructive",
      });
      return;
    }
    cancelMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" data-testid="button-cancel-incident">
            <XCircle className="h-4 w-4 mr-2" />
            Cancel Incident
          </Button>
        )}
      </DialogTrigger>
      <DialogContent data-testid="dialog-cancel-incident">
        <DialogHeader>
          <DialogTitle>Cancel Incident</DialogTitle>
          <DialogDescription>
            This will mark the incident as cancelled. Please provide a reason for cancellation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cancel-reason">Reason for Cancellation *</Label>
            <Textarea
              id="cancel-reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g., Duplicate report, Issue resolved by other means, False alarm..."
              rows={4}
              data-testid="textarea-cancel-reason"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            data-testid="button-cancel-dialog"
          >
            Close
          </Button>
          <Button
            onClick={handleCancel}
            disabled={cancelMutation.isPending || !cancelReason.trim()}
            data-testid="button-confirm-cancel"
          >
            {cancelMutation.isPending ? "Cancelling..." : "Cancel Incident"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
