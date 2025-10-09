import { Button } from "@/components/ui/button";
import { LayoutGrid, List, Table } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "card" | "table" | "grid";

interface ViewSwitcherProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  className?: string;
}

export function ViewSwitcher({ view, onViewChange, className }: ViewSwitcherProps) {
  return (
    <div className={cn("flex items-center gap-1 border rounded-md p-1", className)}>
      <Button
        variant={view === "card" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onViewChange("card")}
        data-testid="view-card"
        className="gap-2"
      >
        <List className="h-4 w-4" />
        <span className="hidden sm:inline">Cards</span>
      </Button>
      <Button
        variant={view === "table" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onViewChange("table")}
        data-testid="view-table"
        className="gap-2"
      >
        <Table className="h-4 w-4" />
        <span className="hidden sm:inline">Table</span>
      </Button>
      <Button
        variant={view === "grid" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onViewChange("grid")}
        data-testid="view-grid"
        className="gap-2"
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="hidden sm:inline">Grid</span>
      </Button>
    </div>
  );
}
