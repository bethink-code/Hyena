import { KPIWidget } from "../KPIWidget";
import { AlertTriangle, Users, DollarSign, Clock } from "lucide-react";

export default function KPIWidgetExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPIWidget
        title="Active Incidents"
        value={12}
        change={-8}
        trend="down"
        icon={AlertTriangle}
      />
      <KPIWidget
        title="Affected Guests"
        value={45}
        change={-15}
        trend="down"
        icon={Users}
      />
      <KPIWidget
        title="Revenue at Risk"
        value="$2.3k"
        change={12}
        trend="up"
        icon={DollarSign}
      />
      <KPIWidget
        title="Avg Resolution Time"
        value="18m"
        change={-22}
        trend="down"
        icon={Clock}
      />
    </div>
  );
}
