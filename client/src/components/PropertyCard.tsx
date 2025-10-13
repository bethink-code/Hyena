import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MapPin, AlertCircle, AlertTriangle } from "lucide-react";
import type { NetworkHealth } from "./NetworkStatusIndicator";

interface PropertyCardProps {
  name: string;
  location: string;
  status: NetworkHealth;
  incidentCount: number;
  criticalCount?: number;
  newCount?: number;
  onClick?: () => void;
  className?: string;
}

export function PropertyCard({
  name,
  location,
  status,
  incidentCount,
  criticalCount = 0,
  newCount = 0,
  onClick,
  className,
}: PropertyCardProps) {
  const statusColors = {
    healthy: "bg-event-success/10 text-event-success border-event-success",
    degraded: "bg-event-high/10 text-event-high border-event-high",
    critical: "bg-event-critical/10 text-event-critical border-event-critical",
    offline: "bg-muted text-muted-foreground border-muted",
  };

  return (
    <Card
      className={cn("hover-elevate cursor-pointer transition-all", className)}
      onClick={onClick}
      data-testid="card-property"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3 mb-3">
          <Badge
            className={cn("uppercase text-xs", statusColors[status])}
            data-testid="badge-property-status"
          >
            {status}
          </Badge>
          <span className="text-sm font-semibold" data-testid="text-incident-count">
            {incidentCount} Active
          </span>
        </div>
        <h3 className="text-lg font-semibold truncate" data-testid="text-property-name">{name}</h3>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span data-testid="text-property-location">{location}</span>
        </div>
        {(criticalCount > 0 || newCount > 0) && (
          <div className="flex items-center gap-4 text-sm">
            {criticalCount > 0 && (
              <div className="flex items-center gap-1.5 text-event-critical" data-testid="text-critical-count">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">{criticalCount} Critical</span>
              </div>
            )}
            {newCount > 0 && (
              <div className="flex items-center gap-1.5 text-event-high" data-testid="text-new-count">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">{newCount} New</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
