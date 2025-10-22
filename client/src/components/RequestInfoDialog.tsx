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
import { MessageSquare } from "lucide-react";

interface RequestInfoDialogProps {
  incidentId: string;
  children?: React.ReactNode;
  onSuccess?: () => void;
}

export function RequestInfoDialog({ incidentId, children, onSuccess }: RequestInfoDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [requestedInfo, setRequestedInfo] = useState("");

  const requestInfoMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PATCH", `/api/incidents/${incidentId}`, {
        requestedInfo,
      });
      const incident = await response.json();
      
      await apiRequest("POST", `/api/incidents/${incidentId}/timeline`, {
        action: `Additional information requested: ${requestedInfo}`,
        actor: "System",
      });
      
      return incident;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/incidents", incidentId, "timeline"] });
      toast({
        title: "Information Requested",
        description: "Request has been logged in the incident timeline",
      });
      setOpen(false);
      setRequestedInfo("");
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log information request",
        variant: "destructive",
      });
    },
  });

  const handleRequest = () => {
    if (!requestedInfo.trim()) {
      toast({
        title: "Details Required",
        description: "Please specify what information is needed",
        variant: "destructive",
      });
      return;
    }
    requestInfoMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" data-testid="button-request-info">
            <MessageSquare className="h-4 w-4 mr-2" />
            Request Info
          </Button>
        )}
      </DialogTrigger>
      <DialogContent data-testid="dialog-request-info">
        <DialogHeader>
          <DialogTitle>Request Additional Information</DialogTitle>
          <DialogDescription>
            Request more details from the reporter, guest, or other parties to help resolve this incident.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="requested-info">Information Needed *</Label>
            <Textarea
              id="requested-info"
              value={requestedInfo}
              onChange={(e) => setRequestedInfo(e.target.value)}
              placeholder="e.g., Please provide room number, error messages, time of occurrence..."
              rows={4}
              data-testid="textarea-requested-info"
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
            onClick={handleRequest}
            disabled={requestInfoMutation.isPending || !requestedInfo.trim()}
            data-testid="button-confirm-request"
          >
            {requestInfoMutation.isPending ? "Submitting..." : "Send Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
