import {
  LayoutDashboard,
  AlertTriangle,
  Wifi,
  BarChart3,
  Building,
  Building2,
  Users as UsersIcon,
  Settings,
  Puzzle,
  Shield,
  ClipboardList,
  History,
  Calendar,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const MANAGER_NAV: NavSection[] = [
  {
    label: "Main",
    items: [
      { title: "Dashboard", href: "/manager", icon: LayoutDashboard },
      { title: "Incidents", href: "/manager/incidents", icon: AlertTriangle },
      { title: "Network Status", href: "/manager/network", icon: Wifi },
    ],
  },
  {
    label: "Analysis",
    items: [
      { title: "Analytics & Reports", href: "/manager/analytics", icon: BarChart3 },
    ],
  },
];

export const HOTEL_MANAGER_NAV: NavSection[] = [
  {
    label: "Main",
    items: [
      { title: "Dashboard", href: "/hotel-manager", icon: LayoutDashboard },
      { title: "Incidents", href: "/hotel-manager/incidents", icon: AlertTriangle },
      { title: "Network Status", href: "/hotel-manager/network", icon: Wifi },
    ],
  },
  {
    label: "Analysis",
    items: [
      { title: "Analytics & Reports", href: "/hotel-manager/analytics", icon: BarChart3 },
    ],
  },
];

export const ADMIN_NAV: NavSection[] = [
  {
    label: "Overview",
    items: [
      { title: "Portfolio Dashboard", href: "/admin", icon: LayoutDashboard },
      { title: "All Properties", href: "/admin/properties", icon: Building2 },
    ],
  },
  {
    label: "Management",
    items: [
      { title: "Organizations", href: "/admin/organizations", icon: Building },
      { title: "Users & Roles", href: "/admin/users", icon: UsersIcon },
      { title: "System Config", href: "/admin/config", icon: Settings },
      { title: "Integrations", href: "/admin/integrations", icon: Puzzle },
    ],
  },
  {
    label: "Reporting",
    items: [
      { title: "Analytics & Reports", href: "/admin/analytics", icon: BarChart3 },
      { title: "Audit Logs", href: "/admin/audit", icon: Shield },
    ],
  },
];

export const TECHNICIAN_NAV: NavSection[] = [
  {
    label: "Work",
    items: [
      { title: "My Work", href: "/technician", icon: ClipboardList },
      { title: "Completed Jobs", href: "/technician/completed", icon: History },
    ],
  },
  {
    label: "Maintenance",
    items: [
      { title: "Preventive Schedule", href: "/technician/schedule", icon: Calendar },
      { title: "Equipment", href: "/technician/equipment", icon: Wrench },
    ],
  },
];
