import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Hash,
  Mail,
  Building2,
  Clock,
  Shield,
  User as UserIcon,
  Key,
  UserX,
  Edit,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { User } from "@shared/schema";
import { format } from "date-fns";

interface UserDetailPanelProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
  propertyName?: string;
  onEdit?: (userId: string) => void;
  onResetPassword?: (userId: string) => void;
  onDeactivate?: (userId: string) => void;
}

export function UserDetailPanel({
  user,
  open,
  onClose,
  propertyName,
  onEdit,
  onResetPassword,
  onDeactivate,
}: UserDetailPanelProps) {
  if (!user) return null;

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "manager":
        return "default";
      case "technician":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getRoleBorderColor = (role: string) => {
    switch (role) {
      case "admin":
        return "border-l-destructive";
      case "manager":
        return "border-l-primary";
      case "technician":
        return "border-l-secondary";
      default:
        return "border-l-border";
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className={cn("w-full sm:max-w-2xl overflow-y-auto border-l-4 p-0", getRoleBorderColor(user.role))}
        data-testid="panel-user-detail"
      >
        <div className="flex flex-col h-full">
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <div className="space-y-2 pr-8">
              <div className="flex items-center gap-2">
                <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">
                  {user.role}
                </Badge>
                <SheetTitle className="text-xl" data-testid="text-user-name">
                  {user.name}
                </SheetTitle>
              </div>
              <SheetDescription className="text-base">
                {user.email}
              </SheetDescription>
            </div>
          </SheetHeader>

          <Tabs defaultValue="summary" className="flex-1 flex flex-col">
            <TabsList className="mx-6 mt-4 w-auto justify-start" data-testid="tabs-user-detail">
              <TabsTrigger value="summary" data-testid="tab-summary">
                Summary
              </TabsTrigger>
              <TabsTrigger value="activity" data-testid="tab-activity">
                Activity
              </TabsTrigger>
              <TabsTrigger value="permissions" data-testid="tab-permissions">
                Permissions
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="summary" className="px-6 py-4 space-y-6 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">User ID:</span>
                      <code className="font-mono text-xs bg-muted px-2 py-1 rounded" data-testid="text-user-id">
                        {user.id}
                      </code>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Username:</span>
                      <span className="font-medium font-mono text-xs" data-testid="text-username">
                        {user.username}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium" data-testid="text-email">
                        {user.email}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Role:</span>
                      <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">
                        {user.role}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Property:</span>
                      <span className="font-medium" data-testid="text-property">
                        {propertyName || "All Properties"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Created:</span>
                      <span className="font-medium font-mono text-xs" data-testid="text-created-at">
                        {format(new Date(user.createdAt), "MMM d, yyyy HH:mm")}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      Account Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Full Name:</span>
                      <span className="font-medium">{user.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Username:</span>
                      <code className="font-mono text-xs">{user.username}</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email Address:</span>
                      <span className="font-medium">{user.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Account Status:</span>
                      <Badge variant="outline">Active</Badge>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="px-6 py-4 space-y-4 mt-0">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Activity Timeline
                </h3>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex gap-4 text-sm border-l-2 pl-4 py-2">
                        <div className="flex-shrink-0 w-32 text-muted-foreground font-mono text-xs">
                          {format(new Date(user.createdAt), "MMM d, HH:mm")}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Account created</p>
                          <p className="text-xs text-muted-foreground">by System</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground pt-4">
                        Additional activity logs will appear here as the user performs actions in the system.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="permissions" className="px-6 py-4 space-y-4 mt-0">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Role & Permissions
                </h3>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Current Role</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Assigned Role:</span>
                      <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">
                        {user.role}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Role Capabilities:</span>
                      <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                        {user.role === "admin" && (
                          <>
                            <li>• Manage all properties</li>
                            <li>• Configure system settings</li>
                            <li>• Manage users and roles</li>
                            <li>• View all incidents and analytics</li>
                          </>
                        )}
                        {user.role === "manager" && (
                          <>
                            <li>• Manage assigned property</li>
                            <li>• View and assign incidents</li>
                            <li>• Monitor property status</li>
                            <li>• Generate reports</li>
                          </>
                        )}
                        {user.role === "technician" && (
                          <>
                            <li>• View assigned incidents</li>
                            <li>• Update incident status</li>
                            <li>• Log issue reports</li>
                            <li>• Access property details</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Property Access</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Assigned Property:</span>
                      <span className="text-sm font-medium">
                        {propertyName || "All Properties"}
                      </span>
                    </div>
                    {user.role === "admin" && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Admin users have access to all properties in the system.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>

          <div className="border-t px-6 py-4 flex flex-wrap gap-2 bg-muted/10">
            {onEdit && (
              <Button
                onClick={() => onEdit(user.id)}
                variant="default"
                data-testid="button-edit-user"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit User
              </Button>
            )}

            {onResetPassword && (
              <Button
                onClick={() => onResetPassword(user.id)}
                variant="outline"
                data-testid="button-reset-password"
              >
                <Key className="h-4 w-4 mr-2" />
                Reset Password
              </Button>
            )}

            {onDeactivate && (
              <Button
                onClick={() => onDeactivate(user.id)}
                variant="outline"
                data-testid="button-deactivate-user"
              >
                <UserX className="h-4 w-4 mr-2" />
                Deactivate
              </Button>
            )}

            <Button
              onClick={onClose}
              variant="outline"
              data-testid="button-close"
              className="ml-auto"
            >
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
