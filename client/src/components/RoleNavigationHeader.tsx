import { Button } from "@/components/ui/button";
import { User, Building2, Settings, Wrench, Home } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

export function RoleNavigationHeader() {
  const [location, setLocation] = useLocation();

  const roles = [
    { path: "/guest", icon: User, label: "Guest" },
    { path: "/manager", icon: Building2, label: "Manager" },
    { path: "/admin", icon: Settings, label: "Admin" },
    { path: "/technician", icon: Wrench, label: "Technician" },
  ];

  return (
    <div className="border-b bg-sidebar">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="font-bold gap-2"
            data-testid="button-logo"
          >
            <Home className="h-4 w-4" />
            <span>Project Hyena</span>
          </Button>
        </div>

        <div className="flex items-center gap-1">
          {roles.map(({ path, icon: Icon, label }) => (
            <Button
              key={path}
              variant={location === path ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setLocation(path)}
              className={cn(
                "gap-2",
                location === path && "bg-sidebar-accent"
              )}
              data-testid={`button-nav-${label.toLowerCase()}`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
