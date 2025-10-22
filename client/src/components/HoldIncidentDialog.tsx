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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Pause } from "lucide-react";

interface HoldIncidentDialogProps {
  incidentId: string;
  children?: React.ReactNode;
  onSuccess?: () => void;
}

export function HoldIncidentDialog({ incidentId, children, onSuccess }: HoldIncidentDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [holdReason, setHoldReason] = useState("");
  const [resumeDate, setResumeDate] = useState("");

  const holdMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PATCH", `/api/incidents/${incidentId}`, {
        status: "on_hold",
        holdReason,
        holdResumeDate: resumeDate ? new Date(resumeDate).toISOString() : null,
      });
      const incident = await response.json();
      
      const resumeInfo = resumeDate ? ` (Expected resume: ${new Date(resumeDate).toLocaleDateString()})` : '';
      await apiRequest("POST", `/api/incidents/${incidentId}/timeline`, {
        action: `Incident put on hold: ${holdReason}${resumeInfo}`,
        actor: "System",
      });
      
      return incident;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/incidents", incidentId, "timeline"] });
      toast({
        title: "Incident On Hold",
        description: "The incident has been put on hold",
      });
      setOpen(false);
      setHoldReason("");
      setResumeDate("");
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to put incident on hold",
        variant: "destructive",
      });
    },
  });

  const handleHold = () => {
    if (!holdReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for holding this incident",
        variant: "destructive",
      });
      return;
    }
    holdMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" data-testid="button-hold-incident">
            <Pause className="h-4 w-4 mr-2" />
            Put On Hold
          </Button>
        )}
      </DialogTrigger>
      <DialogContent data-testid="dialog-hold-incident">
        <DialogHeader>
          <DialogTitle>Put Incident On Hold</DialogTitle>
          <DialogDescription>
            Temporarily pause work on this incident. You can resume it later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hold-reason">Reason for Hold *</Label>
            <Textarea
              id="hold-reason"
              value={holdReason}
              onChange={(e) => setHoldReason(e.target.value)}
              placeholder="e.g., Waiting for vendor response, Parts on order, Scheduled maintenance window..."
              rows={3}
              data-testid="textarea-hold-reason"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume-date">Expected Resume Date (Optional)</Label>
            <Input
              id="resume-date"
              type="datetime-local"
              value={resumeDate}
              onChange={(e) => setResumeDate(e.target.value)}
              data-testid="input-resume-date"
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
            onClick={handleHold}
            disabled={holdMutation.isPending || !holdReason.trim()}
            data-testid="button-confirm-hold"
          >
            {holdMutation.isPending ? "Putting On Hold..." : "Put On Hold"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
