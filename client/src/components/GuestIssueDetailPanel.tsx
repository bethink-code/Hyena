import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Clock, CheckCircle } from "lucide-react";
import { mapToGuestStatus, getGuestStatusInfo } from "@/lib/guestStatusMapping";

export interface GuestIssueDetailProps {
  id: string;
  title: string;
  description: string;
  status: string;
  timestamp: string;
  estimatedResolution?: string;
}

interface GuestIssueDetailPanelProps {
  issue: GuestIssueDetailProps | null;
  open: boolean;
  onClose: () => void;
  onChatWithSupport?: () => void;
}

export function GuestIssueDetailPanel({
  issue,
  open,
  onClose,
  onChatWithSupport,
}: GuestIssueDetailPanelProps) {
  if (!issue) return null;

  const guestStatus = mapToGuestStatus(issue.status);
  const statusInfo = getGuestStatusInfo(guestStatus);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg overflow-y-auto p-0"
        data-testid="panel-guest-issue-detail"
      >
        <div className="flex flex-col h-full">
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <SheetTitle className="text-xl pr-8" data-testid="text-issue-title">
              {issue.title}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 px-6 py-6 space-y-6">
            <Card className="border-2">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10">
                    <statusInfo.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold" data-testid="text-status-label">
                      {statusInfo.label}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {statusInfo.description}
                    </p>
                  </div>
                </div>

                {statusInfo.estimatedTime && guestStatus === "working" && (
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Estimated fix: <span className="font-medium">{statusInfo.estimatedTime}</span>
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-2">
              <h4 className="font-medium">Issue Details</h4>
              <p className="text-sm text-muted-foreground" data-testid="text-issue-description">
                {issue.description}
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Reported {issue.timestamp}</span>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-event-success mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Our team has been notified</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    We're working to resolve this as quickly as possible
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t p-6 bg-muted/30 space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              Need urgent help?
            </p>
            <Button
              onClick={onChatWithSupport}
              className="w-full gap-2"
              data-testid="button-chat-support"
            >
              <MessageCircle className="h-4 w-4" />
              Chat with Support
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full"
              data-testid="button-close"
            >
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
