import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { PriorityBadge, type Priority } from "./PriorityBadge";
import { StatusBadge, type IncidentStatus } from "./StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CancelIncidentDialog } from "./CancelIncidentDialog";
import { HoldIncidentDialog } from "./HoldIncidentDialog";
import { RequestInfoDialog } from "./RequestInfoDialog";
import { ReassignDialog } from "./ReassignDialog";
import { ChangePriorityDialog } from "./ChangePriorityDialog";
import { AssignTechnicianDialog } from "./AssignTechnicianDialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
  Send,
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

interface IncidentDetailPanelProps {
  incident: IncidentDetailProps | null;
  open: boolean;
  onClose: () => void;
  onResolve?: (incidentId: string) => void;
  onEscalate?: (incidentId: string) => void;
}

export function IncidentDetailPanel({
  incident,
  open,
  onClose,
  onResolve,
  onEscalate,
}: IncidentDetailPanelProps) {
  const { toast } = useToast();
  const [comment, setComment] = useState("");

  // Fetch timeline data directly from API
  // Keep query enabled even when panel is closed to maintain cache
  const { data: timelineData = [], isLoading: timelineLoading } = useQuery<Array<{
    timestamp: string;
    action: string;
    actor: string;
  }>>({
    queryKey: ["/api/incidents", incident?.id, "timeline"],
    queryFn: async () => {
      if (!incident?.id) return [];
      const res = await fetch(`/api/incidents/${incident.id}/timeline`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return await res.json();
    },
    enabled: !!incident?.id,
  });

  // Mutation for adding comments - must be called before early return
  const addCommentMutation = useMutation({
    mutationFn: async (commentText: string) => {
      if (!incident?.id) throw new Error("No incident ID");
      const response = await apiRequest("POST", `/api/incidents/${incident.id}/comments`, {
        comment: commentText,
      });
      return await response.json();
    },
    onSuccess: () => {
      if (!incident?.id) return;
      // Invalidate both timeline and incidents queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ["/api/incidents", incident.id, "timeline"] });
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      setComment("");
      toast({
        title: "Comment Added",
        description: "Your comment has been added to the incident timeline.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add comment",
        variant: "destructive",
      });
    },
  });

  if (!incident) return null;

  const borderColors = {
    critical: "border-l-event-critical",
    high: "border-l-event-high",
    medium: "border-l-event-medium",
    low: "border-l-border",
  };

  const handleAddComment = () => {
    if (!comment.trim()) return;
    addCommentMutation.mutate(comment.trim());
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className={cn("w-full sm:max-w-2xl overflow-y-auto border-l-4 p-0", borderColors[incident.priority])}
        data-testid="panel-incident-detail"
      >
        <div className="flex flex-col h-full">
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <div className="space-y-2 pr-8">
              <div className="flex items-center gap-2">
                <PriorityBadge priority={incident.priority} />
                <SheetTitle className="text-xl" data-testid="text-incident-title">
                  {incident.title}
                </SheetTitle>
              </div>
              <SheetDescription className="text-base">
                {incident.description}
              </SheetDescription>
            </div>
          </SheetHeader>

          <Tabs defaultValue="activity" className="flex-1 flex flex-col">
            <TabsList className="mx-6 mt-4 w-auto justify-start" data-testid="tabs-incident-detail">
              <TabsTrigger value="activity" data-testid="tab-activity">
                Activity
              </TabsTrigger>
              <TabsTrigger value="technical" data-testid="tab-technical">
                Technical
              </TabsTrigger>
              <TabsTrigger value="summary" data-testid="tab-summary">
                Summary
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="summary" className="px-6 py-4 space-y-6 mt-0">
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
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Root Cause Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{incident.rootCause}</p>
                      </CardContent>
                    </Card>
                  </>
                )}

                {incident.resolution && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Resolution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{incident.resolution}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="activity" className="px-6 py-4 space-y-4 mt-0">
                {/* Comment Input Form */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Add Comment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Textarea
                      placeholder="Add a comment to the incident timeline..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      data-testid="textarea-comment"
                      className="resize-none"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handleAddComment}
                        disabled={!comment.trim() || addCommentMutation.isPending}
                        size="sm"
                        data-testid="button-add-comment"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {addCommentMutation.isPending ? "Posting..." : "Post Comment"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Activity Timeline */}
                <Separator />
                <h3 className="text-sm font-semibold">Activity Timeline</h3>
                {timelineData && timelineData.length > 0 ? (
                  <div className="space-y-4">
                    {timelineData.map((item, index) => (
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
                      <span className="text-muted-foreground">Incident ID:</span>
                      <code className="font-mono text-xs">{incident.id}</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Priority Level:</span>
                      <span className="font-medium capitalize">{incident.priority}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Status:</span>
                      <span className="font-medium capitalize">{incident.status.replace('_', ' ')}</span>
                    </div>
                    {incident.category && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        <span className="font-medium">{incident.category}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {incident.rootCause && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Root Cause</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{incident.rootCause}</p>
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
            {incident.status === "new" && (
              <AssignTechnicianDialog
                incidentId={incident.id}
                onSuccess={onClose}
              />
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

            <ChangePriorityDialog
              incidentId={incident.id}
              currentPriority={incident.priority}
              onSuccess={onClose}
            />

            {incident.status !== "cancelled" && incident.status !== "resolved" && incident.status !== "duplicate" && (
              <>
                <ReassignDialog
                  incidentId={incident.id}
                  currentAssignee={incident.assignedTo}
                  onSuccess={onClose}
                />

                <RequestInfoDialog
                  incidentId={incident.id}
                  onSuccess={onClose}
                />

                <HoldIncidentDialog
                  incidentId={incident.id}
                  onSuccess={onClose}
                />

                <CancelIncidentDialog
                  incidentId={incident.id}
                  onSuccess={onClose}
                />
              </>
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
