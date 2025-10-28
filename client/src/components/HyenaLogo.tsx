import { Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export function HyenaLogo() {
  const { data, isLoading } = useQuery<{ logoUrl: string | null }>({
    queryKey: ["/api/platform/logo"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6 px-4" data-testid="hyena-logo-loading">
        <Skeleton className="h-32 w-full max-w-[200px]" />
      </div>
    );
  }

  // If logo is uploaded, display it
  if (data?.logoUrl) {
    return (
      <div className="flex items-center justify-center py-6 px-4" data-testid="hyena-logo">
        <img
          src={data.logoUrl}
          alt="Project Hyena"
          className="h-32 max-w-full object-contain"
        />
      </div>
    );
  }

  // Fallback to text + icon
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
