import { cn } from "@/lib/utils";
import { Wifi, WifiOff, AlertTriangle } from "lucide-react";

export type NetworkHealth = "healthy" | "degraded" | "critical" | "offline";

interface NetworkStatusIndicatorProps {
  status: NetworkHealth;
  incidentCount?: number;
  className?: string;
}

export function NetworkStatusIndicator({
  status,
  incidentCount = 0,
  className,
}: NetworkStatusIndicatorProps) {
  const statusConfig = {
    healthy: {
      icon: Wifi,
      text: "Network Healthy",
      color: "text-event-success",
      bgColor: "bg-event-success/10",
    },
    degraded: {
      icon: AlertTriangle,
      text: "Performance Degraded",
      color: "text-event-high",
      bgColor: "bg-event-high/10",
    },
    critical: {
      icon: AlertTriangle,
      text: "Critical Issues",
      color: "text-event-critical",
      bgColor: "bg-event-critical/10",
    },
    offline: {
      icon: WifiOff,
      text: "Network Offline",
      color: "text-event-critical",
      bgColor: "bg-event-critical/10",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn("flex items-center gap-3 p-4 rounded-lg", config.bgColor, className)}
      data-testid="network-status-indicator"
    >
      <Icon className={cn("h-5 w-5", config.color)} />
      <div className="flex-1">
        <p className={cn("font-semibold", config.color)} data-testid="text-network-status">
          {config.text}
        </p>
        {incidentCount > 0 && (
          <p className="text-sm text-muted-foreground" data-testid="text-incident-count">
            {incidentCount} active incident{incidentCount !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  );
}
