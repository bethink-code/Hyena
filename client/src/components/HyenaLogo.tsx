import { Shield } from "lucide-react";

export function HyenaLogo() {
  return (
    <div className="flex items-center justify-center py-6 px-4" data-testid="hyena-logo">
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <Shield className="h-10 w-10 text-primary" />
          <div className="flex flex-col">
            <span className="text-xl font-bold text-foreground">Project Hyena</span>
            <span className="text-xs text-muted-foreground">Network Monitoring Platform</span>
          </div>
        </div>
      </div>
    </div>
  );
}
