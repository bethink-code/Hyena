import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface WizardStep {
  id: number;
  title: string;
  description: string;
  image?: string;
}

interface TroubleshootingWizardProps {
  steps: WizardStep[];
  onComplete: () => void;
  className?: string;
}

export function TroubleshootingWizard({
  steps,
  onComplete,
  className,
}: TroubleshootingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Troubleshooting Guide</CardTitle>
        <div className="flex items-center gap-2 mt-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-2 flex-1">
              <div
                className={cn(
                  "flex items-center justify-center rounded-full h-8 w-8 border-2 transition-colors",
                  index < currentStep
                    ? "bg-event-success border-event-success text-white"
                    : index === currentStep
                    ? "bg-primary border-primary text-white"
                    : "border-muted-foreground text-muted-foreground"
                )}
              >
                {index < currentStep ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5",
                    index < currentStep ? "bg-event-success" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {steps[currentStep].image && (
            <img
              src={steps[currentStep].image}
              alt={steps[currentStep].title}
              className="w-full max-w-xs mx-auto rounded-lg"
            />
          )}
          <div>
            <h3 className="text-lg font-semibold mb-2">{steps[currentStep].title}</h3>
            <p className="text-muted-foreground">{steps[currentStep].description}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            data-testid="button-previous"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button onClick={handleNext} className="flex-1" data-testid="button-next">
            {currentStep === steps.length - 1 ? "Complete" : "Next"}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
