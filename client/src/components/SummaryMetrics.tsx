import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MetricTile {
  id: string;
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "critical" | "high" | "medium" | "success";
}

interface SummaryMetricsProps {
  metrics: MetricTile[];
  className?: string;
}

export function SummaryMetrics({ metrics, className }: SummaryMetricsProps) {
  const variantClasses = {
    default: "border-l-border",
    critical: "border-l-event-critical",
    high: "border-l-event-high",
    medium: "border-l-event-medium",
    success: "border-l-event-success",
  };

  const iconVariantClasses = {
    default: "text-muted-foreground",
    critical: "text-event-critical",
    high: "text-event-high",
    medium: "text-event-medium",
    success: "text-event-success",
  };

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const variant = metric.variant || "default";
        
        return (
          <Card
            key={metric.id}
            className={cn("border-l-4", variantClasses[variant])}
            data-testid={`metric-${metric.id}`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1" data-testid={`metric-label-${metric.id}`}>
                    {metric.label}
                  </p>
                  <p className="text-2xl font-bold" data-testid={`metric-value-${metric.id}`}>
                    {metric.value}
                  </p>
                  {metric.trend && (
                    <p
                      className={cn(
                        "text-xs mt-1",
                        metric.trend.isPositive ? "text-event-success" : "text-event-critical"
                      )}
                      data-testid={`metric-trend-${metric.id}`}
                    >
                      {metric.trend.isPositive ? "↑" : "↓"} {Math.abs(metric.trend.value)}%
                    </p>
                  )}
                </div>
                <div className={cn("p-3 rounded-lg bg-muted/50", iconVariantClasses[variant])}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
