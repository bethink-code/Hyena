import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { HeroSection } from "@/components/HeroSection";
import { NetworkStatusIndicator } from "@/components/NetworkStatusIndicator";
import { IssueReportForm } from "@/components/IssueReportForm";
import { TroubleshootingWizard } from "@/components/TroubleshootingWizard";
import { FeedbackModal } from "@/components/FeedbackModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import heroImage from "@assets/stock_images/modern_hotel_lobby_w_9345d9d3.jpg";
import step1 from "@assets/stock_images/wifi_troubleshooting_00ddfe0a.jpg";
import step2 from "@assets/stock_images/wifi_troubleshooting_5279112e.jpg";
import step3 from "@assets/stock_images/wifi_troubleshooting_4467e740.jpg";

export default function GuestPortal() {
  const [showFeedback, setShowFeedback] = useState(false);

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

        <Tabs defaultValue="troubleshoot" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="troubleshoot" data-testid="tab-troubleshoot">
              Troubleshooting
            </TabsTrigger>
            <TabsTrigger value="report" data-testid="tab-report">
              Report Issue
            </TabsTrigger>
          </TabsList>
          <TabsContent value="troubleshoot" className="mt-6">
            <TroubleshootingWizard
              steps={troubleshootingSteps}
              onComplete={() => setShowFeedback(true)}
            />
          </TabsContent>
          <TabsContent value="report" className="mt-6">
            <IssueReportForm
              onSubmit={(data) => {
                console.log("Issue submitted:", data);
                setShowFeedback(true);
              }}
            />
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
    </AppLayout>
  );
}
