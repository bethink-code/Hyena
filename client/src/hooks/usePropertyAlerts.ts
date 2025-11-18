import { useQuery } from "@tanstack/react-query";
import type { Incident } from "@shared/schema";

// Sources that should be displayed as announcements/alerts
const ANNOUNCEMENT_SOURCES = [
  "manager_announcement",
  "eskom_api",
  "weather_api",
  "api_monitoring",
  "automated_alert",
  "scheduled_check",
];

interface UsePropertyAlertsOptions {
  propertyId?: string;
  sources?: string[];
}

export function usePropertyAlerts({ propertyId, sources = ANNOUNCEMENT_SOURCES }: UsePropertyAlertsOptions = {}) {
  const { data: allIncidents = [], isLoading } = useQuery<Incident[]>({
    queryKey: ["/api/events"],
  });

  // Filter to active announcements/alerts
  const alerts = allIncidents.filter((incident) => {
    // Must be an active status (not resolved or cancelled)
    if (incident.status === "resolved" || incident.status === "cancelled" || incident.status === "duplicate") {
      return false;
    }

    // Must be from an announcement source
    if (!sources.includes(incident.source || "")) {
      return false;
    }

    // If propertyId specified, filter to that property
    if (propertyId && incident.propertyId !== propertyId) {
      return false;
    }

    return true;
  });

  // Sort by priority (critical first) then by created date
  const sortedAlerts = alerts.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4;
    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4;
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Return the highest priority alert
  const topAlert = sortedAlerts[0] || null;

  return {
    alert: topAlert,
    allAlerts: sortedAlerts,
    isLoading,
  };
}
