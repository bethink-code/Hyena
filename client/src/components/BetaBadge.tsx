import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FlaskConical, AlertTriangle, CheckCircle2, Info } from "lucide-react";

export function BetaBadge() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border cursor-pointer bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20 text-xs font-semibold whitespace-nowrap transition-colors"
        onClick={() => setIsOpen(true)}
        data-testid="badge-beta"
      >
        <FlaskConical className="h-3.5 w-3.5" />
        <span className="font-medium">Proof of Concept</span>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FlaskConical className="h-5 w-5 text-amber-500" />
              Proof of Concept Demonstration
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              What you are viewing is a prototype for feedback purposes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="flex gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-700 dark:text-amber-400">This is not a live system</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This demonstration uses simulated data and mock scenarios. No real incidents, guests, or network infrastructure are connected.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                Purpose of this demonstration
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground ml-6">
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Illustrate the proposed user experience and workflows</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Gather feedback on features and interface design</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Demonstrate white-label branding capabilities</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Validate business requirements before full development</span>
                </li>
              </ul>
            </div>

            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                <strong>Your feedback is valuable.</strong> Please share your thoughts on the features, workflows, and user experience shown here. This input will shape the final production system.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
