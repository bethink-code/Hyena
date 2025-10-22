import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { HeroSection } from "@/components/HeroSection";
import { NetworkStatusIndicator } from "@/components/NetworkStatusIndicator";
import { IssueReportForm, type IssueFormData } from "@/components/IssueReportForm";
import { TroubleshootingWizard } from "@/components/TroubleshootingWizard";
import { FeedbackModal } from "@/components/FeedbackModal";
import { EventQueue } from "@/components/EventQueue";
import { EventDetailPanel } from "@/components/EventDetailPanel";
import { AIChatInterface } from "@/components/AIChatInterface";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PROPERTIES } from "@/lib/properties";
import type { Incident, InsertIncident } from "@shared/schema";
import heroImage from "@assets/stock_images/modern_hotel_lobby_w_9345d9d3.jpg";
import step1 from "@assets/stock_images/wifi_troubleshooting_00ddfe0a.jpg";
import step2 from "@assets/stock_images/wifi_troubleshooting_5279112e.jpg";
import step3 from "@assets/stock_images/wifi_troubleshooting_4467e740.jpg";

export default function GuestPortal() {
  const { toast } = useToast();
  const [showFeedback, setShowFeedback] = useState(false);
  const [viewingEventId, setViewingEventId] = useState<string | null>(null);

  // Fetch all events (in a real app, would filter by guest ID)
  const { data: allEvents = [] } = useQuery<Incident[]>({
    queryKey: ["/api/events"],
  });

  // Filter to show guest-related events (source=guest_portal or reported by guest)
  const guestEvents = allEvents.filter(event => 
    event.source === "guest_portal" || event.source === "front_desk"
  );

  // Mutation to create incident from guest report
  const createIncidentMutation = useMutation({
    mutationFn: async (formData: IssueFormData) => {
      // Map form data to incident format
      const incidentData: InsertIncident = {
        title: `${formData.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} - ${formData.location}`,
        description: formData.description,
        priority: "medium", // Default priority for guest reports
        status: "new",
        location: formData.location,
        category: "Network Connectivity", // Map all guest issues to network category
        source: "guest_portal", // Critical: must be guest_portal to appear in "My Issues"
        propertyId: PROPERTIES[0].id, // Default to first property (in real app, would get from user session)
      };

      const response = await apiRequest("POST", "/api/incidents", incidentData);
      const incident = await response.json();

      // Add timeline entry
      await apiRequest("POST", `/api/incidents/${incident.id}/timeline`, {
        action: "Issue reported by guest via portal",
        actor: "Guest Portal",
      });

      return incident;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Issue Reported Successfully",
        description: "Your issue has been submitted. Our team will address it shortly.",
      });
      setShowFeedback(true);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Submit Issue",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const troubleshootingSteps = [
    {
      id: 1,
      title: "Check Your Device",
      description: "Make sure Wi-Fi is enabled on your device and airplane mode is off.",
      image: step1,
    },
    {
      id: 2,
      title: "Forget and Reconnect",
      description: "Forget the network in your settings, then reconnect using your room credentials.",
      image: step2,
    },
    {
      id: 3,
      title: "Restart Your Device",
      description: "Turn your device off completely, wait 10 seconds, then turn it back on.",
      image: step3,
    },
  ];

  return (
    <AppLayout
      title="Guest Portal"
      homeRoute="/guest"
      notificationCount={1}
      showSidebar={false}
    >
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
        <HeroSection
          title="Welcome to Network Support"
          subtitle="Get help with connectivity issues in seconds"
          imageSrc={heroImage}
          ctaText="Test My Connection"
          onCtaClick={() => console.log("Test connection")}
        />

        <NetworkStatusIndicator status="healthy" incidentCount={0} />

        <Tabs defaultValue="ai-chat" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ai-chat" data-testid="tab-ai-chat">
              AI Assistant
            </TabsTrigger>
            <TabsTrigger value="troubleshoot" data-testid="tab-troubleshoot">
              Troubleshooting
            </TabsTrigger>
            <TabsTrigger value="report" data-testid="tab-report">
              Report Issue
            </TabsTrigger>
            <TabsTrigger value="my-issues" data-testid="tab-my-issues">
              My Issues
            </TabsTrigger>
          </TabsList>
          <TabsContent value="ai-chat" className="mt-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Chat with AI Assistant</h3>
                <p className="text-sm text-muted-foreground">
                  Get instant help with network issues through our AI-powered assistant
                </p>
              </div>
              <AIChatInterface />
            </div>
          </TabsContent>
          <TabsContent value="troubleshoot" className="mt-6">
            <TroubleshootingWizard
              steps={troubleshootingSteps}
              onComplete={() => setShowFeedback(true)}
            />
          </TabsContent>
          <TabsContent value="report" className="mt-6">
            <IssueReportForm
              onSubmit={(data) => {
                createIncidentMutation.mutate(data);
              }}
            />
          </TabsContent>
          <TabsContent value="my-issues" className="mt-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">My Reported Issues</h3>
                <p className="text-sm text-muted-foreground">
                  Track the status of your reported network issues
                </p>
              </div>
              {guestEvents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>You haven't reported any issues yet.</p>
                  <p className="text-sm mt-2">Use the "Report Issue" tab to create a new issue.</p>
                </div>
              ) : (
                <EventQueue 
                  events={guestEvents.map(event => ({
                    id: event.id,
                    title: event.title,
                    description: event.description,
                    priority: event.priority as any,
                    status: event.status as any,
                    location: event.location || undefined,
                    assignedTo: event.assignedTo || undefined,
                    timestamp: formatTimestamp(event.createdAt),
                  }))}
                  onEventClick={(eventId) => setViewingEventId(eventId)}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <FeedbackModal
        open={showFeedback}
        onClose={() => setShowFeedback(false)}
        eventTitle="Wi-Fi Troubleshooting"
        onSubmit={(rating, comments) =>
          console.log("Feedback:", { rating, comments })
        }
      />

      <EventDetailPanel
        event={viewingEventId ? (() => {
          const event = allEvents.find(e => e.id === viewingEventId);
          if (!event) return null;
          
          return {
            id: event.id,
            title: event.title,
            description: event.description,
            priority: event.priority as any,
            status: event.status as any,
            location: event.location || undefined,
            assignedTo: event.assignedTo || undefined,
            timestamp: formatTimestamp(event.createdAt),
            category: event.category || undefined,
            affectedGuests: event.affectedGuests || undefined,
            estimatedResolution: event.estimatedResolution || undefined,
            rootCause: event.rootCause || undefined,
            resolution: event.resolution || undefined,
            timeline: [],
          };
        })() : null}
        open={viewingEventId !== null}
        onClose={() => setViewingEventId(null)}
      />
    </AppLayout>
  );
}
