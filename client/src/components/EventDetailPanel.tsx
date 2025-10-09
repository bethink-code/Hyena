import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PriorityBadge, type Priority } from "./PriorityBadge";
import { StatusBadge, type EventStatus } from "./StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MapPin,
  User,
  Clock,
  Hash,
  MessageSquare,
  Activity,
  CheckCircle2,
  AlertCircle,
  FileText,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface EventDetailProps {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: EventStatus;
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

interface EventDetailPanelProps {
  event: EventDetailProps | null;
  open: boolean;
  onClose: () => void;
  onAssign?: (eventId: string) => void;
  onResolve?: (eventId: string) => void;
  onEscalate?: (eventId: string) => void;
}

export function EventDetailPanel({
  event,
  open,
  onClose,
  onAssign,
  onResolve,
  onEscalate,
}: EventDetailPanelProps) {
  if (!event) return null;

  const borderColors = {
    critical: "border-l-event-critical",
    high: "border-l-event-high",
    medium: "border-l-event-medium",
    low: "border-l-border",
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className={cn("w-full sm:max-w-2xl overflow-y-auto border-l-4 p-0", borderColors[event.priority])}
        data-testid="panel-event-detail"
      >
        <div className="flex flex-col h-full">
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2 pr-8">
                <SheetTitle className="text-xl" data-testid="text-event-title">
                  {event.title}
                </SheetTitle>
                <SheetDescription className="text-base">
                  {event.description}
                </SheetDescription>
              </div>
              <PriorityBadge priority={event.priority} />
            </div>
          </SheetHeader>

          <Tabs defaultValue="summary" className="flex-1 flex flex-col">
            <TabsList className="mx-6 mt-4 w-auto justify-start" data-testid="tabs-event-detail">
              <TabsTrigger value="summary" data-testid="tab-summary">
                Summary
              </TabsTrigger>
              <TabsTrigger value="activity" data-testid="tab-activity">
                Activity
              </TabsTrigger>
              <TabsTrigger value="technical" data-testid="tab-technical">
                Technical
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="summary" className="px-6 py-4 space-y-6 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Event ID:</span>
                      <code className="font-mono text-xs bg-muted px-2 py-1 rounded" data-testid="text-event-id">
                        {event.id}
                      </code>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Status:</span>
                      <StatusBadge status={event.status} />
                    </div>

                    {event.location && (
                      <div className="flex items-center gap-2 text-sm" data-testid="text-location">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Location:</span>
                        <span className="font-medium">{event.location}</span>
                      </div>
                    )}

                    {event.assignedTo && (
                      <div className="flex items-center gap-2 text-sm" data-testid="text-assigned-to">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Assigned To:</span>
                        <span className="font-medium">{event.assignedTo}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Reported:</span>
                      <span className="font-medium font-mono text-xs">{event.timestamp}</span>
                    </div>

                    {event.category && (
                      <div className="flex items-center gap-2 text-sm">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Category:</span>
                        <Badge variant="outline">{event.category}</Badge>
                      </div>
                    )}

                    {event.affectedGuests !== undefined && (
                      <div className="flex items-center gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Affected Guests:</span>
                        <span className="font-medium">{event.affectedGuests}</span>
                      </div>
                    )}

                    {event.estimatedResolution && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Est. Resolution:</span>
                        <span className="font-medium">{event.estimatedResolution}</span>
                      </div>
                    )}
                  </div>
                </div>

                {event.rootCause && (
                  <>
                    <Separator />
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Root Cause Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{event.rootCause}</p>
                      </CardContent>
                    </Card>
                  </>
                )}

                {event.resolution && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Resolution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{event.resolution}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="activity" className="px-6 py-4 space-y-4 mt-0">
                <h3 className="text-sm font-semibold">Activity Timeline</h3>
                {event.timeline && event.timeline.length > 0 ? (
                  <div className="space-y-4">
                    {event.timeline.map((item, index) => (
                      <div key={index} className="flex gap-4 text-sm border-l-2 pl-4 py-2">
                        <div className="flex-shrink-0 w-20 text-muted-foreground font-mono text-xs">
                          {item.timestamp}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.action}</p>
                          <p className="text-xs text-muted-foreground">by {item.actor}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
                )}
              </TabsContent>

              <TabsContent value="technical" className="px-6 py-4 space-y-4 mt-0">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  Technical Details
                </h3>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Diagnostic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Event ID:</span>
                      <code className="font-mono text-xs">{event.id}</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Priority Level:</span>
                      <span className="font-medium capitalize">{event.priority}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Status:</span>
                      <span className="font-medium capitalize">{event.status.replace('_', ' ')}</span>
                    </div>
                    {event.category && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        <span className="font-medium">{event.category}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {event.rootCause && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Root Cause</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{event.rootCause}</p>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Additional Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Technical documentation and additional diagnostic information will be displayed here.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>

          <div className="border-t px-6 py-4 flex flex-wrap gap-2 bg-muted/10">
            {event.status === "new" && onAssign && (
              <Button
                onClick={() => onAssign(event.id)}
                variant="default"
                data-testid="button-assign"
              >
                Assign to Technician
              </Button>
            )}
            
            {(event.status === "assigned" || event.status === "in_progress") && onResolve && (
              <Button
                onClick={() => onResolve(event.id)}
                variant="default"
                data-testid="button-resolve"
              >
                Mark as Resolved
              </Button>
            )}

            {event.priority !== "critical" && onEscalate && (
              <Button
                onClick={() => onEscalate(event.id)}
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
              className="ml-auto"
            >
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
