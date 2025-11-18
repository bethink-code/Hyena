import { cn } from "@/lib/utils";
import { Wifi, AlertTriangle, Info, Calendar, Cloud, Zap } from "lucide-react";
import type { Incident } from "@shared/schema";

interface NetworkStatusIndicatorProps {
  incident?: Incident;
  className?: string;
}

// Map source types to icons and prefixes
const sourceConfig: Record<string, { icon: any; prefix: string }> = {
  manager_announcement: { icon: Info, prefix: "Announcement" },
  eskom_api: { icon: Zap, prefix: "Load Shedding Alert" },
  weather_api: { icon: Cloud, prefix: "Weather Notice" },
  api_monitoring: { icon: AlertTriangle, prefix: "Network Alert" },
  automated_alert: { icon: AlertTriangle, prefix: "System Alert" },
  scheduled_check: { icon: Calendar, prefix: "Scheduled Maintenance" },
};

export function NetworkStatusIndicator({
  incident,
  className,
}: NetworkStatusIndicatorProps) {
  // If no incident, don't show anything
  if (!incident) {
    return null;
  }

  // Determine styling based on priority
  const priorityConfig = {
    critical: {
      color: "text-event-critical",
      bgColor: "bg-event-critical/10",
    },
    high: {
      color: "text-event-high",
      bgColor: "bg-event-high/10",
    },
    medium: {
      color: "text-event-medium",
      bgColor: "bg-event-medium/10",
    },
    low: {
      color: "text-event-success",
      bgColor: "bg-event-success/10",
    },
  };

  const config = priorityConfig[incident.priority as keyof typeof priorityConfig] || priorityConfig.medium;
  const source = sourceConfig[incident.source || ""] || { icon: Info, prefix: "Notice" };
  const Icon = source.icon;

  return (
    <div
      className={cn("flex items-center gap-3 p-4 rounded-lg", config.bgColor, className)}
      data-testid="network-status-indicator"
    >
      <Icon className={cn("h-5 w-5 flex-shrink-0", config.color)} />
      <div className="flex-1 min-w-0">
        <p className={cn("font-semibold", config.color)} data-testid="text-network-status">
          {source.prefix}
        </p>
        <p className="text-sm text-muted-foreground mt-0.5" data-testid="text-incident-message">
          {incident.description}
        </p>
      </div>
    </div>
  );
}
