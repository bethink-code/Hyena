import { ReactNode } from "react";
import { RoleNavigationHeader } from "@/components/RoleNavigationHeader";
import { AppHeader } from "@/components/AppHeader";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useLocation } from "wouter";
import { LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface NavSection {
  label?: string;
  items: NavItem[];
}

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  homeRoute: string;
  notificationCount?: number;
  navSections?: NavSection[];
  sidebarHeader?: ReactNode;
  showSidebar?: boolean;
}

export function AppLayout({
  children,
  title,
  homeRoute,
  notificationCount = 0,
  navSections = [],
  sidebarHeader,
  showSidebar = true,
}: AppLayoutProps) {
  const [location, setLocation] = useLocation();

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  if (!showSidebar) {
    return (
      <div className="min-h-screen bg-background">
        <RoleNavigationHeader />
        <AppHeader
          title={title}
          homeRoute={homeRoute}
          notificationCount={notificationCount}
        />
        <main>{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <RoleNavigationHeader />
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex w-full">
          <Sidebar>
            {sidebarHeader && <SidebarHeader className="p-4">{sidebarHeader}</SidebarHeader>}
            <SidebarContent>
              {navSections.map((section, index) => (
                <SidebarGroup key={index}>
                  {section.label && <SidebarGroupLabel>{section.label}</SidebarGroupLabel>}
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {section.items.map((item) => (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton
                            onClick={() => setLocation(item.href)}
                            isActive={location === item.href}
                            data-testid={`sidebar-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}
            </SidebarContent>
          </Sidebar>

          <div className="flex flex-col flex-1">
            <AppHeader
              title={title}
              homeRoute={homeRoute}
              notificationCount={notificationCount}
            />
            <main className="flex-1">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
