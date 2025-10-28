import { useQuery } from "@tanstack/react-query";
import type { Organization } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface OrganizationLogoProps {
  organizationId: string;
}

export function OrganizationLogo({ organizationId }: OrganizationLogoProps) {
  const { data: organization, isLoading } = useQuery<Organization>({
    queryKey: ["/api/organizations", organizationId],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-2" data-testid="logo-loading">
        <Skeleton className="h-12 w-32" />
      </div>
    );
  }

  if (!organization) {
    return null;
  }

  return (
    <div className="flex items-center justify-center py-2" data-testid="organization-logo-container">
      {organization.logoUrl ? (
        <img
          src={organization.logoUrl}
          alt={`${organization.name} logo`}
          className="h-12 w-auto object-contain"
          data-testid="organization-logo-image"
        />
      ) : (
        <div className="text-lg font-semibold text-foreground" data-testid="organization-logo-text">
          {organization.name}
        </div>
      )}
    </div>
  );
}
