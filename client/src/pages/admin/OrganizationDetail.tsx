import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppLayout } from "@/components/AppLayout";
import { HyenaLogo } from "@/components/HyenaLogo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { THEME_LABELS, THEME_MAP, applyTheme, type ThemeKey } from "@/lib/themes";
import type { Organization, Property, User } from "@shared/schema";
import {
  ArrowLeft,
  Building2,
  Palette,
  MapPin,
  Users as UsersIcon,
  Settings,
  Upload,
  Edit,
  Trash2,
  Plus,
  LayoutDashboard,
  BarChart3,
  FileText,
  Puzzle,
  Shield,
} from "lucide-react";

const SA_TIMEZONES = [
  "Africa/Johannesburg",
  "Africa/Cape_Town",
  "Africa/Durban",
  "Africa/Pretoria",
];

const propertyFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Location is required"),
  address: z.string().optional(),
  status: z.enum(["active", "inactive", "maintenance"]),
  timezone: z.string(),
});

type PropertyFormData = z.infer<typeof propertyFormSchema>;

const contactFormSchema = z.object({
  contactEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  contactPerson: z.string().optional(),
  headquarters: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const regionalFormSchema = z.object({
  timezone: z.string(),
  language: z.enum(["en", "af"]),
});

type RegionalFormData = z.infer<typeof regionalFormSchema>;

export default function OrganizationDetail() {
  const { toast } = useToast();
  const params = useParams<{ id: string }>();
  const organizationId = params.id!;

  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [deletePropertyId, setDeletePropertyId] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey | null>(null);
  const [logoUrl, setLogoUrl] = useState("");

  // Fetch organization
  const { data: organization, isLoading: orgLoading } = useQuery<Organization>({
    queryKey: [`/api/organizations/${organizationId}`],
  });

  // Fetch properties
  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: [`/api/organizations/${organizationId}/properties`],
  });

  // Fetch all users and filter by organization
  const { data: allUsers = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Get all properties for lookup
  const { data: allProperties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const organizationUsers = allUsers.filter(
    (user) => user.organizationId === organizationId
  );

  // Property form
  const propertyForm = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      name: "",
      location: "",
      address: "",
      status: "active",
      timezone: "Africa/Johannesburg",
    },
  });

  // Contact form
  const contactForm = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      contactEmail: organization?.contactEmail || "",
      contactPhone: organization?.contactPhone || "",
      contactPerson: organization?.contactPerson || "",
      headquarters: organization?.headquarters || "",
    },
  });

  // Regional form
  const regionalForm = useForm<RegionalFormData>({
    resolver: zodResolver(regionalFormSchema),
    defaultValues: {
      timezone: organization?.timezone || "Africa/Johannesburg",
      language: (organization?.language as "en" | "af") || "en",
    },
  });

  // Update organization theme mutation
  const updateThemeMutation = useMutation({
    mutationFn: async (theme: ThemeKey) => {
      const response = await apiRequest("PATCH", `/api/organizations/${organizationId}`, {
        theme,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/organizations/${organizationId}`] });
      toast({
        title: "Theme Updated",
        description: "Organization theme has been changed",
      });
    },
  });

  // Update organization logo mutation
  const updateLogoMutation = useMutation({
    mutationFn: async (logoUrl: string | null) => {
      const response = await apiRequest("PATCH", `/api/organizations/${organizationId}`, {
        logoUrl,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/organizations/${organizationId}`] });
      toast({
        title: "Logo Updated",
        description: "Organization logo has been changed",
      });
    },
  });

  // Create property mutation
  const createPropertyMutation = useMutation({
    mutationFn: async (data: PropertyFormData) => {
      const response = await apiRequest("POST", `/api/organizations/${organizationId}/properties`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/organizations/${organizationId}/properties`] });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "Property Created",
        description: "New property has been added",
      });
      setPropertyDialogOpen(false);
      propertyForm.reset();
    },
  });

  // Update property mutation
  const updatePropertyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PropertyFormData }) => {
      const response = await apiRequest("PATCH", `/api/properties/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/organizations/${organizationId}/properties`] });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "Property Updated",
        description: "Property has been updated",
      });
      setPropertyDialogOpen(false);
      setEditingProperty(null);
      propertyForm.reset();
    },
  });

  // Delete property mutation
  const deletePropertyMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/properties/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/organizations/${organizationId}/properties`] });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "Property Deleted",
        description: "Property has been removed",
      });
      setDeletePropertyId(null);
    },
  });

  // Update contact info mutation
  const updateContactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const response = await apiRequest("PATCH", `/api/organizations/${organizationId}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/organizations/${organizationId}`] });
      toast({
        title: "Contact Information Updated",
        description: "Organization contact details have been saved",
      });
    },
  });

  // Update regional settings mutation
  const updateRegionalMutation = useMutation({
    mutationFn: async (data: RegionalFormData) => {
      const response = await apiRequest("PATCH", `/api/organizations/${organizationId}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/organizations/${organizationId}`] });
      toast({
        title: "Regional Settings Updated",
        description: "Organization regional settings have been saved",
      });
    },
  });

  const handleSaveThemeAndLogo = () => {
    if (selectedTheme) {
      updateThemeMutation.mutate(selectedTheme);
    }
    if (logoUrl && logoUrl !== organization?.logoUrl) {
      updateLogoMutation.mutate(logoUrl);
    }
  };

  const handlePropertySubmit = (data: PropertyFormData) => {
    if (editingProperty) {
      updatePropertyMutation.mutate({ id: editingProperty.id, data });
    } else {
      createPropertyMutation.mutate(data);
    }
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    propertyForm.reset({
      name: property.name,
      location: property.location,
      address: property.address || "",
      status: property.status as "active" | "inactive" | "maintenance",
      timezone: property.timezone,
    });
    setPropertyDialogOpen(true);
  };

  const handleAddProperty = () => {
    setEditingProperty(null);
    propertyForm.reset({
      name: "",
      location: "",
      address: "",
      status: "active",
      timezone: "Africa/Johannesburg",
    });
    setPropertyDialogOpen(true);
  };

  const navSections = [
    {
      label: "Overview",
      items: [
        { title: "Portfolio Dashboard", href: "/admin", icon: LayoutDashboard },
        { title: "All Organizations", href: "/admin/organizations", icon: Building2 },
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

  if (orgLoading) {
    return (
      <AppLayout
        title="Organization Details"
        homeRoute="/admin"
        navSections={navSections}
        sidebarHeader={<HyenaLogo />}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Loading organization...</div>
        </div>
      </AppLayout>
    );
  }

  if (!organization) {
    return (
      <AppLayout
        title="Organization Not Found"
        homeRoute="/admin"
        navSections={navSections}
        sidebarHeader={<HyenaLogo />}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Organization not found</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title={organization.name}
      homeRoute="/admin"
      navSections={navSections}
      sidebarHeader={<HyenaLogo />}
    >
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/admin/organizations">
            <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Organizations
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            {organization.logoUrl && (
              <img
                src={organization.logoUrl}
                alt={organization.name}
                className="h-16 w-16 object-contain rounded"
                data-testid="img-org-logo"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold" data-testid="text-org-name">{organization.name}</h1>
              <p className="text-muted-foreground">Organization ID: {organization.id}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="branding" className="space-y-6">
          <TabsList>
            <TabsTrigger value="branding" data-testid="tab-branding">
              <Palette className="h-4 w-4 mr-2" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="properties" data-testid="tab-properties">
              <MapPin className="h-4 w-4 mr-2" />
              Properties
            </TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">
              <UsersIcon className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Branding */}
          <TabsContent value="branding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Theme & Branding</CardTitle>
                <CardDescription>
                  Customize the theme and logo for this organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Theme Selector */}
                <div className="space-y-3">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={selectedTheme || organization.theme}
                    onValueChange={(value) => {
                      setSelectedTheme(value as ThemeKey);
                      applyTheme(value as ThemeKey);
                    }}
                  >
                    <SelectTrigger id="theme" data-testid="select-theme">
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

                {/* Logo Upload */}
                <div className="space-y-3">
                  <Label>Organization Logo</Label>

                  {/* Current Logo Preview */}
                  {organization.logoUrl && (
                    <div className="flex items-center gap-4 p-4 border rounded-lg bg-card">
                      <div className="flex items-center justify-center w-32 h-32 border rounded-md bg-muted/30">
                        <img
                          src={organization.logoUrl}
                          alt="Current Logo"
                          className="max-w-full max-h-full object-contain"
                          data-testid="img-current-logo"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                          ✓ Logo Uploaded
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Current organization logo
                        </p>
                      </div>
                    </div>
                  )}

                  {/* URL Input */}
                  <div className="space-y-2">
                    <Label htmlFor="logo-url">Logo URL</Label>
                    <Input
                      id="logo-url"
                      type="url"
                      placeholder="https://example.com/logo.png"
                      value={logoUrl || organization.logoUrl || ""}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      data-testid="input-logo-url"
                    />
                  </div>

                  {/* File Upload */}
                  <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-2">Upload Logo File</p>
                      <p className="text-xs text-muted-foreground mb-3">
                        PNG, JPG, SVG - max 5MB
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="logo-file-upload"
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
                          formData.append("orgId", organizationId);

                          try {
                            const response = await fetch("/api/organizations/upload-logo", {
                              method: "POST",
                              body: formData,
                            });

                            if (!response.ok) {
                              throw new Error("Upload failed");
                            }

                            queryClient.invalidateQueries({
                              queryKey: [`/api/organizations/${organizationId}`],
                            });
                            toast({
                              title: "✓ Logo Uploaded",
                              description: "Logo uploaded successfully",
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
                        onClick={() => document.getElementById("logo-file-upload")?.click()}
                        data-testid="button-upload-logo"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Logo File
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveThemeAndLogo}
                    disabled={updateThemeMutation.isPending || updateLogoMutation.isPending}
                    data-testid="button-save-branding"
                  >
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Properties */}
          <TabsContent value="properties" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Properties</CardTitle>
                    <CardDescription>
                      Manage properties for this organization
                    </CardDescription>
                  </div>
                  <Button onClick={handleAddProperty} data-testid="button-add-property">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Property
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {properties.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No properties found. Add your first property to get started.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Timezone</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {properties.map((property) => (
                        <TableRow key={property.id} data-testid={`row-property-${property.id}`}>
                          <TableCell className="font-medium">{property.name}</TableCell>
                          <TableCell>{property.location}</TableCell>
                          <TableCell>{property.address || "-"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                property.status === "active"
                                  ? "default"
                                  : property.status === "maintenance"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {property.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{property.timezone}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditProperty(property)}
                                data-testid={`button-edit-property-${property.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeletePropertyId(property.id)}
                                data-testid={`button-delete-property-${property.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Users */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Users</CardTitle>
                <CardDescription>
                  Users assigned to this organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                {organizationUsers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground" data-testid="text-no-users">
                    No users found for this organization.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Property</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {organizationUsers.map((user) => {
                        const property = allProperties.find((p) => p.id === user.propertyId);
                        return (
                          <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{user.role}</Badge>
                            </TableCell>
                            <TableCell>{property?.name || "All Properties"}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Settings */}
          <TabsContent value="settings" className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Organization contact details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...contactForm}>
                  <form onSubmit={contactForm.handleSubmit((data) => updateContactMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={contactForm.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="contact@example.com"
                              {...field}
                              data-testid="input-contact-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={contactForm.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Phone</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="+27 11 123 4567"
                              {...field}
                              data-testid="input-contact-phone"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={contactForm.control}
                      name="contactPerson"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Person</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John Doe"
                              {...field}
                              data-testid="input-contact-person"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={contactForm.control}
                      name="headquarters"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Headquarters</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Cape Town, South Africa"
                              {...field}
                              data-testid="input-headquarters"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={updateContactMutation.isPending}
                        data-testid="button-save-contact"
                      >
                        Save Contact Information
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Regional Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Regional Settings</CardTitle>
                <CardDescription>
                  Timezone and language preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...regionalForm}>
                  <form onSubmit={regionalForm.handleSubmit((data) => updateRegionalMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={regionalForm.control}
                      name="timezone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Timezone</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-timezone">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SA_TIMEZONES.map((tz) => (
                                <SelectItem key={tz} value={tz}>
                                  {tz}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={regionalForm.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Language</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-language">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="af">Afrikaans</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={updateRegionalMutation.isPending}
                        data-testid="button-save-regional"
                      >
                        Save Regional Settings
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* SLA Targets - Mockup */}
            <Card>
              <CardHeader>
                <CardTitle>SLA Targets</CardTitle>
                <CardDescription>
                  Service level agreement targets (Coming Soon)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sla-critical">Critical Response Time (minutes)</Label>
                  <Input id="sla-critical" type="number" defaultValue="15" disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sla-high">High Response Time (minutes)</Label>
                  <Input id="sla-high" type="number" defaultValue="30" disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sla-medium">Medium Response Time (hours)</Label>
                  <Input id="sla-medium" type="number" defaultValue="4" disabled />
                </div>
                <div className="flex justify-end">
                  <Button disabled>Save SLA Targets</Button>
                </div>
              </CardContent>
            </Card>

            {/* Notifications - Mockup */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure notification preferences (Coming Soon)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive incident updates via email
                    </p>
                  </div>
                  <Switch disabled />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive critical alerts via SMS
                    </p>
                  </div>
                  <Switch disabled />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Slack Integration</p>
                    <p className="text-sm text-muted-foreground">
                      Post updates to Slack channels
                    </p>
                  </div>
                  <Switch disabled />
                </div>
              </CardContent>
            </Card>

            {/* Integrations - Mockup */}
            <Card>
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
                <CardDescription>
                  Connect external services (Coming Soon)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">PagerDuty</p>
                      <p className="text-sm text-muted-foreground">
                        Incident escalation platform
                      </p>
                    </div>
                    <Button variant="outline" disabled>
                      Connect
                    </Button>
                  </div>
                </div>
                <div className="p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Jira</p>
                      <p className="text-sm text-muted-foreground">
                        Project management and tracking
                      </p>
                    </div>
                    <Button variant="outline" disabled>
                      Connect
                    </Button>
                  </div>
                </div>
                <div className="p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">ServiceNow</p>
                      <p className="text-sm text-muted-foreground">
                        IT service management
                      </p>
                    </div>
                    <Button variant="outline" disabled>
                      Connect
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Property Dialog */}
      <Dialog open={propertyDialogOpen} onOpenChange={setPropertyDialogOpen}>
        <DialogContent data-testid="dialog-property">
          <DialogHeader>
            <DialogTitle>
              {editingProperty ? "Edit Property" : "Add Property"}
            </DialogTitle>
            <DialogDescription>
              {editingProperty
                ? "Update property details"
                : "Add a new property to this organization"}
            </DialogDescription>
          </DialogHeader>
          <Form {...propertyForm}>
            <form onSubmit={propertyForm.handleSubmit(handlePropertySubmit)} className="space-y-4">
              <FormField
                control={propertyForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Grand Hotel" {...field} data-testid="input-property-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={propertyForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Cape Town" {...field} data-testid="input-property-location" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={propertyForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123 Main Street"
                        {...field}
                        data-testid="input-property-address"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={propertyForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-property-status">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={propertyForm.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-property-timezone">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SA_TIMEZONES.map((tz) => (
                          <SelectItem key={tz} value={tz}>
                            {tz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPropertyDialogOpen(false)}
                  data-testid="button-cancel-property"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createPropertyMutation.isPending || updatePropertyMutation.isPending}
                  data-testid="button-submit-property"
                >
                  {editingProperty ? "Update" : "Add"} Property
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Property Confirmation Dialog */}
      <AlertDialog open={!!deletePropertyId} onOpenChange={() => setDeletePropertyId(null)}>
        <AlertDialogContent data-testid="dialog-delete-property">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this property? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletePropertyId) {
                  deletePropertyMutation.mutate(deletePropertyId);
                }
              }}
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
