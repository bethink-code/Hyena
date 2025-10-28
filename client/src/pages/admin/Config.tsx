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

  // Fetch platform logo
  const { data: platformLogo } = useQuery<{ logoUrl: string | null }>({
    queryKey: ["/api/platform/logo"],
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

            {/* Note: Organization theme and logo assignment has been moved to Organizations → Branding tab */}
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Organization-specific themes and logos are now managed in the <strong>Organizations</strong> section, 
                under each organization's <strong>Branding</strong> tab.
              </p>
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
