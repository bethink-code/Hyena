import { Mail, Wrench, CheckCircle, LucideIcon } from "lucide-react";

export type GuestStatus = "received" | "working" | "fixed" | "resolved";

export interface GuestStatusInfo {
  label: string;
  description: string;
  estimatedTime?: string;
  icon: LucideIcon;
}

export function mapToGuestStatus(technicalStatus: string): GuestStatus {
  switch (technicalStatus) {
    case "new":
      return "received";
    case "assigned":
    case "in_progress":
      return "working";
    case "resolved":
      return "fixed";
    case "closed":
      return "resolved";
    default:
      return "received";
  }
}

export function getGuestStatusInfo(guestStatus: GuestStatus): GuestStatusInfo {
  switch (guestStatus) {
    case "received":
      return {
        label: "We've received your report",
        description: "Our team has been notified and will start working on this soon.",
        icon: Mail,
      };
    case "working":
      return {
        label: "We're working on it",
        description: "Our team is actively resolving this issue.",
        estimatedTime: "15-30 minutes",
        icon: Wrench,
      };
    case "fixed":
      return {
        label: "Fixed!",
        description: "This issue has been resolved. Please test and let us know if you still experience problems.",
        icon: CheckCircle,
      };
    case "resolved":
      return {
        label: "Resolved",
        description: "This issue has been closed.",
        icon: CheckCircle,
      };
  }
}
