import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { User, Building2, Settings, Wrench, LucideIcon } from "lucide-react";

export type UserRole = "guest" | "manager" | "admin" | "technician";

interface RoleSelectorProps {
  onSelectRole: (role: UserRole) => void;
  className?: string;
}

interface RoleOption {
  role: UserRole;
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

export function RoleSelector({ onSelectRole, className }: RoleSelectorProps) {
  const roles: RoleOption[] = [
    {
      role: "guest",
      icon: User,
      title: "Guest Portal",
      description: "Self-service troubleshooting and issue reporting",
      color: "text-primary",
    },
    {
      role: "manager",
      icon: Building2,
      title: "Property Management",
      description: "Monitor incidents and manage operations",
      color: "text-event-medium",
    },
    {
      role: "admin",
      icon: Settings,
      title: "Platform Admin",
      description: "Multi-property oversight and configuration",
      color: "text-event-high",
    },
    {
      role: "technician",
      icon: Wrench,
      title: "Technician",
      description: "Field service and incident resolution",
      color: "text-event-success",
    },
  ];

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
      {roles.map(({ role, icon: Icon, title, description, color }) => (
        <Card
          key={role}
          className="hover-elevate cursor-pointer transition-all"
          onClick={() => onSelectRole(role)}
          data-testid={`card-role-${role}`}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className={cn("p-3 rounded-lg bg-muted", color)}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
