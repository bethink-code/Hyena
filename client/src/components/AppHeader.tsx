import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Home, User, Settings, LogOut, Bell, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

interface AppHeaderProps {
  title: string;
  homeRoute: string;
  showNotifications?: boolean;
  notificationCount?: number;
  showProfileMenu?: boolean;
  onHelpClick?: () => void;
}

export function AppHeader({
  title,
  homeRoute,
  showNotifications = true,
  notificationCount = 0,
  showProfileMenu = true,
  onHelpClick,
}: AppHeaderProps) {
  const [, setLocation] = useLocation();

  return (
    <div className="border-b bg-card">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold">{title}</h1>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation(homeRoute)}
            data-testid="button-home"
          >
            <Home className="h-5 w-5" />
          </Button>

          {showNotifications && (
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              data-testid="button-notifications"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  data-testid="badge-notification-count"
                >
                  {notificationCount}
                </Badge>
              )}
            </Button>
          )}

          {onHelpClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onHelpClick}
              data-testid="button-help"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
          )}

          <ThemeToggle />

          {showProfileMenu && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-user-menu">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem data-testid="menu-profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem data-testid="menu-preferences">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Preferences</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => {
                    console.log("Logout clicked");
                    setLocation("/");
                  }}
                  data-testid="menu-logout"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}
