import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { HyenaLogo } from "@/components/HyenaLogo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PROPERTIES } from "@/lib/properties";
import { UserDetailPanel } from "@/components/UserDetailPanel";
import type { User } from "@shared/schema";
import { baseUserInsertSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ADMIN_NAV } from "@/config/navigation";
import {
  UserPlus,
} from "lucide-react";

const formSchema = baseUserInsertSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof formSchema>;

export default function Users() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users?type=platform"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      email: "",
      role: "technician",
      userType: "platform",
      propertyId: null,
      organizationId: null,
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/users", {
        ...data,
        userType: "platform",
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users?type=platform"] });
      toast({
        title: "User Created",
        description: "New Hyena platform user has been added successfully",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createUserMutation.mutate(data);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "super_user":
        return "default";
      case "hyena_manager":
        return "default";
      case "hyena_user":
        return "default";
      case "technician":
        return "default";
      default:
        return "secondary";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "super_user":
        return "Super User";
      case "hyena_manager":
        return "Hyena Manager";
      case "hyena_user":
        return "Hyena User";
      case "technician":
        return "Technician";
      default:
        return role;
    }
  };

  const getPropertyName = (propertyId: string | null) => {
    if (!propertyId) return "All Properties";
    const property = PROPERTIES.find(p => p.id === propertyId);
    return property?.name || "Unknown Property";
  };

  return (
    <AppLayout
      title="User Management"
      homeRoute="/admin"
      navSections={ADMIN_NAV}
      sidebarHeader={<HyenaLogo />}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Hyena Platform Users</h2>
            <p className="text-muted-foreground">Manage Hyena platform user access and permissions</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-user">
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Hyena Platform User</DialogTitle>
                <DialogDescription>
                  Create a new Hyena platform user (Super user, Manager, User, or Technician)
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            data-testid="input-name"
                            placeholder="John Doe" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            data-testid="input-email"
                            type="email"
                            placeholder="john@hotel.com" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input 
                            data-testid="input-username"
                            placeholder="john.doe" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            data-testid="input-password"
                            type="password"
                            placeholder="••••••" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-role">
                              <SelectValue placeholder="Select a platform role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="super_user">Super User</SelectItem>
                            <SelectItem value="hyena_manager">Hyena Manager</SelectItem>
                            <SelectItem value="hyena_user">Hyena User</SelectItem>
                            <SelectItem value="technician">Technician</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      data-testid="button-submit-user"
                      disabled={createUserMutation.isPending}
                    >
                      {createUserMutation.isPending ? "Creating..." : "Create User"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Users ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No users found</div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div 
                    key={user.id} 
                    className="flex items-center justify-between p-4 border rounded-md hover-elevate cursor-pointer" 
                    data-testid={`user-card-${user.id}`}
                    onClick={() => setSelectedUserId(user.id)}
                  >
                    <div className="space-y-1">
                      <div className="font-medium" data-testid={`text-name-${user.id}`}>{user.name}</div>
                      <div className="text-sm text-muted-foreground" data-testid={`text-email-${user.id}`}>{user.email}</div>
                      <div className="text-xs text-muted-foreground" data-testid={`text-property-${user.id}`}>{getPropertyName(user.propertyId)}</div>
                    </div>
                    <Badge 
                      data-testid={`badge-role-${user.id}`}
                      variant={getRoleBadgeVariant(user.role)}
                    >
                      {getRoleLabel(user.role)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <UserDetailPanel
        user={users.find(u => u.id === selectedUserId) || null}
        open={!!selectedUserId}
        onClose={() => setSelectedUserId(null)}
        propertyName={selectedUserId ? getPropertyName(users.find(u => u.id === selectedUserId)?.propertyId || null) : undefined}
        onEdit={(userId) => {
          toast({
            title: "Edit User",
            description: "Edit functionality will be implemented soon",
          });
        }}
        onResetPassword={(userId) => {
          toast({
            title: "Reset Password",
            description: "Password reset functionality will be implemented soon",
          });
        }}
        onDeactivate={(userId) => {
          toast({
            title: "Deactivate User",
            description: "User deactivation functionality will be implemented soon",
          });
        }}
      />
    </AppLayout>
  );
}
