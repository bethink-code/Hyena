import { useState } from "react";
import { ViewSwitcher, type ViewMode } from "../ViewSwitcher";

export default function ViewSwitcherExample() {
  const [view, setView] = useState<ViewMode>("card");

  return (
    <div className="space-y-4">
      <ViewSwitcher view={view} onViewChange={setView} />
      <p className="text-sm text-muted-foreground">Current view: {view}</p>
    </div>
  );
}
