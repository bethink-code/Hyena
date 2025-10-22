import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface KPIWidgetProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  trend?: "up" | "down";
  className?: string;
  onClick?: () => void;
}

export function KPIWidget({
  title,
  value,
  change,
  icon: Icon,
  trend,
  className,
  onClick,
}: KPIWidgetProps) {
  const isPositiveTrend = trend === "up";
  const trendColor = isPositiveTrend ? "text-event-success" : "text-event-critical";

  return (
    <Card 
      className={cn(className, onClick && "cursor-pointer hover-elevate active-elevate-2")}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid="text-kpi-value">
          {value}
        </div>
        {change !== undefined && (
          <p className={cn("text-xs flex items-center gap-1 mt-1", trendColor)}>
            {isPositiveTrend ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span data-testid="text-kpi-change">
              {Math.abs(change)}% from last period
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
