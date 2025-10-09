import { RoleSelector } from "@/components/RoleSelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserRole } from "@/components/RoleSelector";
import { useLocation } from "wouter";
import { Zap } from "lucide-react";

export default function LandingPage() {
  const [, setLocation] = useLocation();

  const handleRoleSelect = (role: UserRole) => {
    console.log("Role selected:", role);
    setLocation(`/${role}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Project Hyena</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold">Network Monitoring Platform</h2>
            <p className="text-lg text-muted-foreground">
              Proactive event-driven monitoring for hospitality networks
            </p>
          </div>

          <Card className="border-primary/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Zap className="h-6 w-6 text-primary" />
                <div className="flex-1">
                  <CardTitle>Event Simulator</CardTitle>
                  <CardDescription>
                    Create and test network events for demonstration and testing
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setLocation('/simulator')}
                  variant="default"
                  data-testid="button-simulator"
                >
                  Open Simulator
                </Button>
              </div>
            </CardHeader>
          </Card>

          <RoleSelector onSelectRole={handleRoleSelect} />
        </div>
      </main>
    </div>
  );
}
