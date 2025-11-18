import { useQuery } from "@tanstack/react-query";
import type { Incident } from "@shared/schema";

interface UsePropertyAlertsOptions {
  propertyId?: string;
}

export function usePropertyAlerts({ propertyId }: UsePropertyAlertsOptions = {}) {
  const { data: allIncidents = [], isLoading } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
  });

  // Filter to active alerts (informational status updates)
  const alerts = allIncidents.filter((incident) => {
    // Must be an active status (not resolved or cancelled)
    if (incident.status === "resolved" || incident.status === "cancelled" || incident.status === "duplicate") {
      return false;
    }

    // Must be an alert (not an incident work item)
    if (incident.itemType !== "alert") {
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
    
    // Guard against missing createdAt (fallback to 0 for invalid dates)
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });

  // Return the highest priority alert
  const topAlert = sortedAlerts[0] || null;

  return {
    alert: topAlert,
    allAlerts: sortedAlerts,
    isLoading,
  };
}
