import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MapPin, AlertTriangle } from "lucide-react";
import type { NetworkHealth } from "./NetworkStatusIndicator";

interface PropertyCardProps {
  name: string;
  location: string;
  status: NetworkHealth;
  incidentCount: number;
  onClick?: () => void;
  className?: string;
}

export function PropertyCard({
  name,
  location,
  status,
  incidentCount,
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
        <CardTitle className="flex items-start justify-between">
          <span className="text-lg">{name}</span>
          <Badge
            className={cn("uppercase text-xs", statusColors[status])}
            data-testid="badge-property-status"
          >
            {status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>
        {incidentCount > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-event-high" />
            <span className="text-event-high font-medium">
              {incidentCount} active incident{incidentCount !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
