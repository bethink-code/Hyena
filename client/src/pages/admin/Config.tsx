import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { HyenaLogo } from "@/components/HyenaLogo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { THEME_LABELS, THEME_MAP, applyTheme, type ThemeKey } from "@/lib/themes";
import type { Organization } from "@shared/schema";
import {
  LayoutDashboard,
  Building2,
  Users as UsersIcon,
  Settings,
  BarChart3,
  FileText,
  Puzzle,
  Shield,
  Palette,
  Upload,
} from "lucide-react";

export default function Config() {
  const { toast } = useToast();
  const [previewTheme, setPreviewTheme] = useState<ThemeKey | null>(null);
  const [originalTheme] = useState<ThemeKey>('table_mountain_blue'); // Store Hyena's default
  
  // Fetch organizations for theme management
  const { data: organizations = [] } = useQuery<Organization[]>({
    queryKey: ["/api/organizations"],
  });

  // Fetch platform logo
  const { data: platformLogo } = useQuery<{ logoUrl: string | null }>({
    queryKey: ["/api/platform/logo"],
  });

  // Update organization theme or logo
  const updateThemeMutation = useMutation({
    mutationFn: async ({ orgId, theme, logoUrl }: { orgId: string; theme?: ThemeKey; logoUrl?: string | null }) => {
      const updates: any = {};
      if (theme !== undefined) updates.theme = theme;
      if (logoUrl !== undefined) updates.logoUrl = logoUrl;
      
      const response = await apiRequest("PATCH", `/api/organizations/${orgId}`, updates);
      return await response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizations"] });
      const updateType = variables.theme ? "Theme" : "Logo";
      toast({
        title: `${updateType} Updated`,
        description: `Organization ${updateType.toLowerCase()} has been changed`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update organization",
        variant: "destructive",
      });
    },
  });

  // Apply preview theme
  const handlePreviewTheme = (theme: ThemeKey) => {
    setPreviewTheme(theme);
    applyTheme(theme);
  };

  // Reset preview - restore administrator's original theme (Hyena branding)
  const handleResetPreview = () => {
    setPreviewTheme(null);
    applyTheme(originalTheme);
  };
  
  const navSections = [
    {
      label: "Overview",
      items: [
        { title: "Portfolio Dashboard", href: "/admin", icon: LayoutDashboard },
        { title: "All Properties", href: "/admin/properties", icon: Building2 },
      ],
    },
    {
      label: "Management",
      items: [
        { title: "Users & Roles", href: "/admin/users", icon: UsersIcon },
        { title: "System Config", href: "/admin/config", icon: Settings },
        { title: "Integrations", href: "/admin/integrations", icon: Puzzle },
      ],
    },
    {
      label: "Reporting",
      items: [
        { title: "Regional Analytics", href: "/admin/analytics", icon: BarChart3 },
        { title: "Reports", href: "/admin/reports", icon: FileText },
        { title: "Audit Logs", href: "/admin/audit", icon: Shield },
      ],
    },
  ];

  return (
    <AppLayout
      title="System Configuration"
      homeRoute="/admin"
      navSections={navSections}
      sidebarHeader={<HyenaLogo />}
    >
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">System Configuration</h2>
          <p className="text-muted-foreground">Platform-wide settings and preferences</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Platform Branding
            </CardTitle>
            <CardDescription>Upload your Hyena platform logo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Platform Logo</Label>
              
              {/* Current Logo Preview */}
              {platformLogo?.logoUrl && (
                <div className="flex items-center gap-4 p-4 border rounded-lg bg-card">
                  <div className="flex items-center justify-center w-32 h-32 border rounded-md bg-muted/30">
                    <img
                      src={platformLogo.logoUrl}
                      alt="Platform Logo"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                      ✓ Logo Uploaded
                    </p>
                    <p className="text-xs text-muted-foreground">
                      This logo is currently displayed in Admin and Technician interfaces
                    </p>
                  </div>
                </div>
              )}
              
              {/* Upload Section */}
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
                <div className="flex-1">
                  <p className="text-sm font-medium mb-2">
                    {platformLogo?.logoUrl ? "Replace Platform Logo" : "Upload Platform Logo"}
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    This logo will appear in Admin and Technician interfaces
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="platform-logo-upload"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      const formData = new FormData();
                      formData.append("logo", file);

                      try {
                        const response = await fetch("/api/platform/upload-logo", {
                          method: "POST",
                          body: formData,
                        });

                        if (!response.ok) {
                          throw new Error("Upload failed");
                        }

                        queryClient.invalidateQueries({ queryKey: ["/api/platform/logo"] });
                        toast({
                          title: "✓ Logo Uploaded",
                          description: "Platform logo has been updated successfully",
                        });
                      } catch (error: any) {
                        toast({
                          title: "Upload Failed",
                          description: error.message || "Failed to upload logo",
                          variant: "destructive",
                        });
                      }

                      e.target.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("platform-logo-upload")?.click()}
                    data-testid="button-upload-platform-logo"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {platformLogo?.logoUrl ? "Replace Logo" : "Upload Logo File"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Basic platform configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform-name">Platform Name</Label>
              <Input id="platform-name" defaultValue="Project Hyena" data-testid="input-platform-name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-email">Support Email</Label>
              <Input id="support-email" type="email" defaultValue="support@hyena.net" data-testid="input-support-email" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">Enable system-wide maintenance</p>
              </div>
              <Switch id="maintenance-mode" data-testid="switch-maintenance" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-assign">Auto-assign Incidents</Label>
                <p className="text-sm text-muted-foreground">Automatically assign new incidents</p>
              </div>
              <Switch id="auto-assign" defaultChecked data-testid="switch-auto-assign" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Organization Themes
            </CardTitle>
            <CardDescription>
              Configure white-label themes for each hotel chain
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme Preview Section */}
            <div className="space-y-3">
              <Label>Preview Themes</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(THEME_LABELS).map(([key, label]) => (
                  <Button
                    key={key}
                    variant={previewTheme === key ? "default" : "outline"}
                    onClick={() => handlePreviewTheme(key as ThemeKey)}
                    className="justify-start"
                    data-testid={`button-preview-${key}`}
                  >
                    <div 
                      className="w-4 h-4 rounded-full mr-2" 
                      style={{
                        backgroundColor: key === 'table_mountain_blue' ? 'hsl(212 84% 32%)' :
                                       key === 'kalahari_gold' ? 'hsl(43 39% 52%)' :
                                       key === 'sunset_yellow' ? 'hsl(43 98% 53%)' :
                                       key === 'jacaranda_purple' ? 'hsl(280 70% 60%)' :
                                       'hsl(0 84% 60%)'
                      }}
                    />
                    {label}
                  </Button>
                ))}
              </div>
              {previewTheme && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleResetPreview}
                  data-testid="button-reset-preview"
                >
                  Reset Preview
                </Button>
              )}
            </div>

            {/* Organization Theme & Logo Assignment */}
            <div className="space-y-4">
              <Label>Assign Themes & Logos to Organizations</Label>
              {organizations.length === 0 ? (
                <p className="text-sm text-muted-foreground">No organizations found</p>
              ) : (
                <div className="space-y-4">
                  {organizations.map((org) => (
                    <Card key={org.id}>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div>
                            <p className="font-semibold text-lg mb-1">{org.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Organization ID: {org.id}
                            </p>
                          </div>
                          
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor={`theme-${org.id}`}>Theme</Label>
                              <Select
                                value={org.theme}
                                onValueChange={(theme) => {
                                  updateThemeMutation.mutate({ 
                                    orgId: org.id, 
                                    theme: theme as ThemeKey 
                                  });
                                }}
                              >
                                <SelectTrigger id={`theme-${org.id}`} data-testid={`select-theme-${org.id}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(THEME_LABELS).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>
                                      {label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor={`logo-${org.id}`}>Organization Logo</Label>
                              <div className="flex gap-2">
                                <Input
                                  id={`logo-${org.id}`}
                                  type="url"
                                  placeholder="https://example.com/logo.png"
                                  defaultValue={org.logoUrl || ""}
                                  onBlur={async (e) => {
                                    const newLogoUrl = e.target.value.trim();
                                    if (newLogoUrl !== (org.logoUrl || "")) {
                                      try {
                                        await apiRequest("PATCH", `/api/organizations/${org.id}/logo`, {
                                          logoUrl: newLogoUrl || null,
                                        });
                                        queryClient.invalidateQueries({ queryKey: ["/api/organizations"] });
                                        toast({
                                          title: "✓ Logo Updated",
                                          description: `Logo URL saved for ${org.name}`,
                                        });
                                      } catch (error: any) {
                                        toast({
                                          title: "Error",
                                          description: error.message || "Failed to update logo",
                                          variant: "destructive",
                                        });
                                      }
                                    }
                                  }}
                                  data-testid={`input-logo-${org.id}`}
                                />
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  id={`file-${org.id}`}
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    if (file.size > 5242880) {
                                      toast({
                                        title: "File too large",
                                        description: "Please select an image under 5MB",
                                        variant: "destructive",
                                      });
                                      return;
                                    }

                                    const formData = new FormData();
                                    formData.append("logo", file);
                                    formData.append("orgId", org.id);

                                    try {
                                      const response = await fetch("/api/organizations/upload-logo", {
                                        method: "POST",
                                        body: formData,
                                      });

                                      if (!response.ok) {
                                        throw new Error("Upload failed");
                                      }

                                      const data = await response.json();
                                      queryClient.invalidateQueries({ queryKey: ["/api/organizations"] });
                                      toast({
                                        title: "✓ Logo Uploaded",
                                        description: `Logo uploaded successfully for ${org.name}`,
                                      });
                                    } catch (error: any) {
                                      toast({
                                        title: "Upload Failed",
                                        description: error.message || "Failed to upload logo",
                                        variant: "destructive",
                                      });
                                    }

                                    e.target.value = "";
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => document.getElementById(`file-${org.id}`)?.click()}
                                  data-testid={`button-upload-logo-${org.id}`}
                                >
                                  Upload File
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Enter a URL or upload a file (PNG, JPG, SVG - max 5MB)
                              </p>
                            </div>
                          </div>
                          
                          {org.logoUrl && (
                            <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                              <img 
                                src={org.logoUrl} 
                                alt={`${org.name} logo`}
                                className="h-8 w-auto object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                              <span className="text-xs text-muted-foreground">Current logo</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button data-testid="button-save-config">Save Changes</Button>
        </div>
      </div>
    </AppLayout>
  );
}
