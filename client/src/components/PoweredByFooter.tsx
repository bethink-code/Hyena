import { Shield } from "lucide-react";

export function PoweredByFooter() {
  return (
    <footer className="border-t py-6 mt-8">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
          <Shield className="h-4 w-4" />
          <span>Powered by <span className="font-semibold text-foreground">Hyena</span> Incident Management Platform</span>
        </div>
      </div>
    </footer>
  );
}
