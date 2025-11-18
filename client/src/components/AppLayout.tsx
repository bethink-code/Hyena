import { ReactNode, useState } from "react";
import { RoleNavigationHeader } from "@/components/RoleNavigationHeader";
import { AppHeader } from "@/components/AppHeader";
import { HelpPanel } from "@/components/HelpPanel";
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
  showNotifications?: boolean;
  showProfileMenu?: boolean;
  navSections?: NavSection[];
  sidebarHeader?: ReactNode;
  showSidebar?: boolean;
}

export function AppLayout({
  children,
  title,
  homeRoute,
  notificationCount = 0,
  showNotifications = true,
  showProfileMenu = true,
  navSections = [],
  sidebarHeader,
  showSidebar = true,
}: AppLayoutProps) {
  const [location, setLocation] = useLocation();
  const [helpPanelOpen, setHelpPanelOpen] = useState(false);

  const headerHeight = "3.5rem"; // ~56px for header with py-2 + button
  
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
    "--sidebar-top": headerHeight,
    "--sidebar-height": `calc(100vh - ${headerHeight})`,
  };

  if (!showSidebar) {
    return (
      <div className="min-h-screen bg-background">
        <RoleNavigationHeader />
        <AppHeader
          title={title}
          homeRoute={homeRoute}
          notificationCount={notificationCount}
          showNotifications={showNotifications}
          showProfileMenu={showProfileMenu}
          onHelpClick={() => setHelpPanelOpen(true)}
        />
        <main className="p-6">{children}</main>
        <HelpPanel open={helpPanelOpen} onClose={() => setHelpPanelOpen(false)} />
      </div>
    );
  }

  return (
    <div className="h-screen bg-background">
      <RoleNavigationHeader />
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex w-full h-full">
          <Sidebar>
            {sidebarHeader && <SidebarHeader className="p-4">{sidebarHeader}</SidebarHeader>}
            <SidebarContent>
              {navSections.map((section, index) => (
                <SidebarGroup key={index}>
                  {section.label && <SidebarGroupLabel>{section.label}</SidebarGroupLabel>}
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {section.items.map((item) => (
                        <SidebarMenuItem key={item.title}>
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
              showNotifications={showNotifications}
              showProfileMenu={showProfileMenu}
              onHelpClick={() => setHelpPanelOpen(true)}
            />
            <main className="flex-1 p-6">{children}</main>
          </div>
        </div>
      </SidebarProvider>
      <HelpPanel open={helpPanelOpen} onClose={() => setHelpPanelOpen(false)} />
    </div>
  );
}
