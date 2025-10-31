import { AppLayout } from "@/components/AppLayout";
import { HyenaLogo } from "@/components/HyenaLogo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TECHNICIAN_NAV } from "@/config/navigation";
import {
  Activity,
  ExternalLink,
  Server,
  Wifi,
  Network,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Equipment() {
  const handleOpenNetworkInfrastructure = () => {
    window.open("http://129.232.224.154:5101/", "_blank", "noopener,noreferrer");
  };

  return (
    <AppLayout
      title="Network Infrastructure"
      homeRoute="/technician"
      navSections={TECHNICIAN_NAV}
      sidebarHeader={<HyenaLogo />}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-1">Network Device Status</h2>
          <p className="text-muted-foreground">
            Live network infrastructure monitoring and device status across all properties
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card
            className="hover-elevate active-elevate-2 cursor-pointer transition-all"
            onClick={handleOpenNetworkInfrastructure}
            data-testid="card-network-infrastructure"
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Network Infrastructure Report
                </span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
              <CardDescription>
                Complete network infrastructure monitoring - live device status, performance metrics, and health indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-md bg-primary/10 p-2">
                    <Server className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Network Devices</div>
                    <div className="text-xs text-muted-foreground">
                      Routers, switches, and firewalls
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-md bg-primary/10 p-2">
                    <Wifi className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Access Points</div>
                    <div className="text-xs text-muted-foreground">
                      Wireless infrastructure status
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-md bg-primary/10 p-2">
                    <Network className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Real-Time Metrics</div>
                    <div className="text-xs text-muted-foreground">
                      Live performance monitoring
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full md:w-auto"
                  onClick={handleOpenNetworkInfrastructure}
                  data-testid="button-open-network-infrastructure"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Network Infrastructure Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
