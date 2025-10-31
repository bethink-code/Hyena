import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { HyenaLogo } from "@/components/HyenaLogo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ADMIN_NAV } from "@/config/navigation";
import { 
  Building2, 
  ChevronRight,
} from "lucide-react";
import type { Organization } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { applyTheme, type ThemeKey } from "@/lib/themes";

export default function Organizations() {
  const { data: organizations, isLoading } = useQuery<Organization[]>({
    queryKey: ["/api/organizations"],
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active, theme }: { id: string; active: boolean; theme?: ThemeKey }) => {
      const response = await apiRequest("PATCH", `/api/organizations/${id}`, { active });
      return { response, theme };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizations"] });
      // Apply theme if organization was activated
      if (data.theme) {
        applyTheme(data.theme);
      }
    },
  });

  if (isLoading) {
    return (
      <AppLayout
        title="Organizations"
        homeRoute="/admin"
        navSections={ADMIN_NAV}
        sidebarHeader={<HyenaLogo />}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Loading organizations...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Organizations"
      homeRoute="/admin"
      navSections={ADMIN_NAV}
      sidebarHeader={<HyenaLogo />}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">Organizations</h2>
            <p className="text-muted-foreground">
              Manage hotel chains, their branding, properties, and settings
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              <strong>Note:</strong> Only one organization can be active at a time. Activating an organization applies its theme and makes its data visible system-wide.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {organizations?.map((org) => (
            <Link key={org.id} href={`/admin/organizations/${org.id}`}>
              <Card className="hover-elevate active-elevate-2 cursor-pointer h-full">
                <CardHeader className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {org.logoUrl ? (
                        <img 
                          src={org.logoUrl} 
                          alt={org.name}
                          className="h-10 w-10 object-contain rounded"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <CardTitle className="truncate">{org.name}</CardTitle>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </div>
                  <CardDescription className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="capitalize">
                      {org.theme.replace(/_/g, ' ')}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground space-y-1">
                    {org.headquarters && (
                      <div className="truncate">📍 {org.headquarters}</div>
                    )}
                    {org.contactEmail && (
                      <div className="truncate">✉️ {org.contactEmail}</div>
                    )}
                  </div>
                  <div 
                    className="flex items-center gap-2 pt-2 border-t"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Switch
                      checked={org.active}
                      onCheckedChange={(checked) => {
                        toggleActiveMutation.mutate({ 
                          id: org.id, 
                          active: checked,
                          theme: checked ? org.theme as ThemeKey : undefined
                        });
                      }}
                      disabled={toggleActiveMutation.isPending}
                      data-testid={`switch-active-${org.id}`}
                      className="scale-75 origin-left"
                    />
                    <span className="text-sm text-muted-foreground">
                      {org.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {organizations && organizations.length === 0 && (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No organizations found.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
