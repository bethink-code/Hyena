import { useQuery } from "@tanstack/react-query";
import type { Organization } from "@shared/schema";

/**
 * Hook to fetch the currently active organization
 * Returns the organization marked as active=true in the database
 * Uses the same query key as the organizations list to ensure cache invalidation works
 */
export function useActiveOrganization() {
  return useQuery<Organization[], Error, Organization | null>({
    queryKey: ["/api/organizations"],
    select: (organizations) => {
      return organizations.find(org => org.active) || null;
    },
  });
}
