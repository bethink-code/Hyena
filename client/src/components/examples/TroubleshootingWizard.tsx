import { TroubleshootingWizard } from "../TroubleshootingWizard";
import step1 from "@assets/stock_images/wifi_troubleshooting_00ddfe0a.jpg";
import step2 from "@assets/stock_images/wifi_troubleshooting_5279112e.jpg";
import step3 from "@assets/stock_images/wifi_troubleshooting_4467e740.jpg";

export default function TroubleshootingWizardExample() {
  const steps = [
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
    <div className="max-w-2xl">
      <TroubleshootingWizard
        steps={steps}
        onComplete={() => console.log("Troubleshooting completed")}
      />
    </div>
  );
}
