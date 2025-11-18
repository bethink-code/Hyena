import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { OrganizationLogo } from "@/components/OrganizationLogo";
import { NetworkStatusIndicator } from "@/components/NetworkStatusIndicator";
import { useActiveOrganization } from "@/hooks/use-active-organization";
import { usePropertyAlerts } from "@/hooks/usePropertyAlerts";
import { HOTEL_MANAGER_NAV } from "@/config/navigation";
import { getPropertyById } from "@/lib/properties";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Wifi, Clock, MapPin } from "lucide-react";
import type { Incident } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function NetworkStatus() {
  const { data: activeOrg } = useActiveOrganization();
  
  // PROTOTYPE NOTE: In production, propertyId would come from authenticated user session
  const propertyId = "1";
  const property = getPropertyById(propertyId);

  // Get property alerts
  const { alert } = usePropertyAlerts({ propertyId });

  // Fetch all incidents for this property
  const { data: allIncidents = [] } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
  });

  // Filter to active alerts (informational status updates) for this property
  const activeIncidents = allIncidents.filter(i => 
    i.propertyId === propertyId &&
    i.itemType === 'alert' && // Only show alerts on Network Status
    i.status !== 'resolved' && 
    i.status !== 'cancelled' && 
    i.status !== 'duplicate'
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 dark:text-red-400';
      case 'high': return 'text-orange-600 dark:text-orange-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-muted-foreground';
    }
  };

  const getPriorityVariant = (priority: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <AppLayout
      title="Network Status"
      navSections={HOTEL_MANAGER_NAV}
      homeRoute="/hotel-manager"
      sidebarHeader={activeOrg && <OrganizationLogo organizationId={activeOrg.id} />}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Network Status</h2>
          <p className="text-muted-foreground">Network monitoring for {property?.name}</p>
        </div>

        <NetworkStatusIndicator incident={alert || undefined} />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              Active Network Alerts
            </CardTitle>
            <CardDescription>
              {activeIncidents.length} active incident{activeIncidents.length !== 1 ? 's' : ''} affecting network services
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeIncidents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Wifi className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No active network incidents</p>
                <p className="text-sm">All systems operational</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeIncidents.map((incident) => (
                  <div 
                    key={incident.id}
                    className="border rounded-lg p-4 hover-elevate"
                    data-testid={`incident-${incident.id}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold" data-testid="text-incident-title">
                            {incident.title}
                          </h3>
                          <Badge variant={getPriorityVariant(incident.priority)} data-testid="badge-priority">
                            {incident.priority}
                          </Badge>
                          <Badge variant="outline" data-testid="badge-status">
                            {incident.status}
                          </Badge>
                        </div>
                        
                        {incident.description && (
                          <p className="text-sm text-muted-foreground" data-testid="text-incident-description">
                            {incident.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                          {incident.location && (
                            <div className="flex items-center gap-1" data-testid="text-location">
                              <MapPin className="h-3 w-3" />
                              {incident.location}
                            </div>
                          )}
                          <div className="flex items-center gap-1" data-testid="text-time">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true })}
                          </div>
                          {incident.source && (
                            <Badge variant="outline" className="text-xs" data-testid="badge-source">
                              {incident.source.replace(/_/g, ' ')}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <AlertTriangle className={`h-5 w-5 flex-shrink-0 ${getPriorityColor(incident.priority)}`} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
