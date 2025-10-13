import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PriorityBadge, type Priority } from "./PriorityBadge";
import { StatusBadge, type IncidentStatus } from "./StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  User,
  Clock,
  Hash,
  MessageSquare,
  Activity,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface IncidentDetailProps {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: IncidentStatus;
  location?: string;
  assignedTo?: string;
  timestamp: string;
  category?: string;
  affectedGuests?: number;
  estimatedResolution?: string;
  rootCause?: string;
  resolution?: string;
  timeline?: Array<{
    timestamp: string;
    action: string;
    actor: string;
  }>;
}

interface IncidentDetailModalProps {
  incident: IncidentDetailProps | null;
  open: boolean;
  onClose: () => void;
  onAssign?: (incidentId: string) => void;
  onResolve?: (incidentId: string) => void;
  onEscalate?: (incidentId: string) => void;
}

export function IncidentDetailModal({
  incident,
  open,
  onClose,
  onAssign,
  onResolve,
  onEscalate,
}: IncidentDetailModalProps) {
  if (!incident) return null;

  const borderColors = {
    critical: "border-l-event-critical",
    high: "border-l-event-high",
    medium: "border-l-event-medium",
    low: "border-l-border",
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className={cn("max-w-3xl max-h-[90vh] overflow-y-auto border-l-4", borderColors[incident.priority])}
        data-testid="modal-incident-detail"
      >
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <DialogTitle className="text-xl" data-testid="text-incident-title">
                {incident.title}
              </DialogTitle>
              <DialogDescription className="text-base">
                {incident.description}
              </DialogDescription>
            </div>
            <PriorityBadge priority={incident.priority} />
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Incident ID:</span>
                <code className="font-mono text-xs bg-muted px-2 py-1 rounded" data-testid="text-incident-id">
                  {incident.id}
                </code>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Status:</span>
                <StatusBadge status={incident.status} />
              </div>

              {incident.location && (
                <div className="flex items-center gap-2 text-sm" data-testid="text-location">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium">{incident.location}</span>
                </div>
              )}

              {incident.assignedTo && (
                <div className="flex items-center gap-2 text-sm" data-testid="text-assigned-to">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Assigned To:</span>
                  <span className="font-medium">{incident.assignedTo}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Reported:</span>
                <span className="font-medium font-mono text-xs">{incident.timestamp}</span>
              </div>

              {incident.category && (
                <div className="flex items-center gap-2 text-sm">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Category:</span>
                  <Badge variant="outline">{incident.category}</Badge>
                </div>
              )}

              {incident.affectedGuests !== undefined && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Affected Guests:</span>
                  <span className="font-medium">{incident.affectedGuests}</span>
                </div>
              )}

              {incident.estimatedResolution && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Est. Resolution:</span>
                  <span className="font-medium">{incident.estimatedResolution}</span>
                </div>
              )}
            </div>
          </div>

          {incident.rootCause && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Root Cause Analysis</h4>
                <p className="text-sm text-muted-foreground">{incident.rootCause}</p>
              </div>
            </>
          )}

          {incident.resolution && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Resolution</h4>
                <p className="text-sm text-muted-foreground">{incident.resolution}</p>
              </div>
            </>
          )}

          {incident.timeline && incident.timeline.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Activity Timeline</h4>
                <div className="space-y-3">
                  {incident.timeline.map((item, index) => (
                    <div key={index} className="flex gap-3 text-sm">
                      <div className="flex-shrink-0 w-20 text-muted-foreground font-mono text-xs">
                        {item.timestamp}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{item.action}</p>
                        <p className="text-xs text-muted-foreground">by {item.actor}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          <div className="flex flex-wrap gap-2">
            {incident.status === "new" && onAssign && (
              <Button
                onClick={() => onAssign(incident.id)}
                variant="default"
                data-testid="button-assign"
              >
                Assign to Technician
              </Button>
            )}
            
            {(incident.status === "assigned" || incident.status === "in_progress") && onResolve && (
              <Button
                onClick={() => onResolve(incident.id)}
                variant="default"
                data-testid="button-resolve"
              >
                Mark as Resolved
              </Button>
            )}

            {incident.priority !== "critical" && onEscalate && (
              <Button
                onClick={() => onEscalate(incident.id)}
                variant="outline"
                data-testid="button-escalate"
              >
                Escalate Priority
              </Button>
            )}

            <Button
              onClick={onClose}
              variant="outline"
              data-testid="button-close"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
