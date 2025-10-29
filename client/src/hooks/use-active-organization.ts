import { useQuery } from "@tanstack/react-query";
import type { Organization } from "@shared/schema";

/**
 * Hook to fetch the currently active organization
 * Returns the organization marked as active=true in the database
 */
export function useActiveOrganization() {
  return useQuery<Organization | null>({
    queryKey: ["/api/organizations/active"],
    queryFn: async () => {
      const response = await fetch('/api/organizations');
      if (!response.ok) {
        throw new Error('Failed to fetch organizations');
      }
      const organizations: Organization[] = await response.json();
      return organizations.find(org => org.active) || null;
    },
  });
}
