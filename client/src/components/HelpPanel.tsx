import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Info } from "lucide-react";

interface HelpPanelProps {
  open: boolean;
  onClose: () => void;
}

const routeToSpecMap: Record<string, string> = {
  "/manager": "/src/docs/manager/dashboard.html",
  "/manager/incidents": "/src/docs/manager/incidents.html",
  "/admin": "/src/docs/admin/portfolio.html",
  "/technician": "/src/docs/technician/work-queue.html",
  "/technician/incidents": "/src/docs/technician/work-queue.html",
};

export function HelpPanel({ open, onClose }: HelpPanelProps) {
  const [location] = useLocation();
  const [specContent, setSpecContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const loadSpec = async () => {
      setLoading(true);
      setError(null);

      const specPath = routeToSpecMap[location];
      
      if (!specPath) {
        setSpecContent("");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(specPath);
        if (!response.ok) {
          throw new Error("Failed to load specification");
        }
        const html = await response.text();
        setSpecContent(html);
      } catch (err) {
        console.error("Error loading spec:", err);
        setError("Unable to load documentation for this page.");
        setSpecContent("");
      } finally {
        setLoading(false);
      }
    };

    loadSpec();
  }, [location, open]);

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      "/manager": "Manager Dashboard",
      "/manager/incidents": "Incident Queue",
      "/admin": "Admin Center - Portfolio Dashboard",
      "/technician": "Technician Work Queue",
      "/technician/incidents": "Technician Work Queue",
    };
    return titles[location] || "Page Documentation";
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[700px] sm:max-w-[700px]" data-testid="help-panel">
        <SheetHeader className="mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <SheetTitle>Functional Specification</SheetTitle>
          </div>
          <SheetDescription>
            {getPageTitle()}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Loading documentation...</div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <Info className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!loading && !error && !specContent && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Documentation is not available for this page yet. Specifications are available for:
                Manager Dashboard, Incident Queue, Admin Center, and Technician Work Queue.
              </AlertDescription>
            </Alert>
          )}

          {!loading && !error && specContent && (
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: specContent }}
            />
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
