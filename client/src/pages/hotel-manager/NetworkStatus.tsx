import { AppLayout } from "@/components/AppLayout";
import { OrganizationLogo } from "@/components/OrganizationLogo";
import { useActiveOrganization } from "@/hooks/use-active-organization";
import { HOTEL_MANAGER_NAV } from "@/config/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NetworkStatus() {
  const { data: activeOrg } = useActiveOrganization();

  return (
    <AppLayout
      title="Network Status"
      navSections={HOTEL_MANAGER_NAV}
      homeRoute="/hotel-manager"
      sidebarHeader={activeOrg && <OrganizationLogo organizationId={activeOrg.id} />}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h2 className="text-2xl font-bold mb-6">Network Status</h2>
        <Card>
          <CardHeader>
            <CardTitle>Property Network Health</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Network monitoring for The Table Bay Hotel</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
