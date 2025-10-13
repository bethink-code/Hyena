import { PropertyCard } from "./PropertyCard";
import { ViewSwitcher, type ViewMode } from "./ViewSwitcher";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { useState } from "react";
import type { NetworkHealth } from "./NetworkStatusIndicator";

interface Property {
  id?: string;
  name: string;
  location: string;
  status: NetworkHealth;
  incidentCount: number;
  criticalCount?: number;
  newCount?: number;
}

interface PropertyListProps {
  properties: Property[];
  onPropertyClick?: (property: Property) => void;
  className?: string;
}

export function PropertyList({ properties, onPropertyClick, className }: PropertyListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Apply filters
  const filteredProperties = properties.filter(property => {
    // Search filter
    const matchesSearch = searchTerm === "" || 
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === "all" || property.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={className}>
      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-start sm:items-center flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-search-properties"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40" data-testid="select-status-filter-properties">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="healthy">Healthy</SelectItem>
            <SelectItem value="degraded">Degraded</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
          </SelectContent>
        </Select>

        <ViewSwitcher view={viewMode} onViewChange={setViewMode} />
      </div>

      {filteredProperties.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No properties found matching your filters
        </div>
      ) : (
        <>
          {viewMode === "card" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property.name}
                  {...property}
                  onClick={() => onPropertyClick?.(property)}
                />
              ))}
            </div>
          )}

          {viewMode === "table" && (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Incidents</TableHead>
                    {filteredProperties.some(p => p.criticalCount !== undefined && p.criticalCount > 0) && (
                      <TableHead className="text-right">Critical</TableHead>
                    )}
                    {filteredProperties.some(p => p.newCount !== undefined && p.newCount > 0) && (
                      <TableHead className="text-right">New</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProperties.map((property) => (
                    <TableRow
                      key={property.name}
                      className="cursor-pointer hover-elevate"
                      onClick={() => onPropertyClick?.(property)}
                      data-testid={`row-property-${property.id || property.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <TableCell className="font-medium">{property.name}</TableCell>
                      <TableCell className="text-muted-foreground">{property.location}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            property.status === "healthy" ? "default" :
                            property.status === "degraded" ? "secondary" :
                            property.status === "critical" ? "destructive" :
                            "outline"
                          }
                          data-testid={`badge-status-${property.id || property.name.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{property.incidentCount}</TableCell>
                      {filteredProperties.some(p => p.criticalCount !== undefined && p.criticalCount > 0) && (
                        <TableCell className="text-right">
                          {property.criticalCount !== undefined && property.criticalCount > 0 ? (
                            <Badge variant="destructive" className="min-w-6 justify-center">
                              {property.criticalCount}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      )}
                      {filteredProperties.some(p => p.newCount !== undefined && p.newCount > 0) && (
                        <TableCell className="text-right">
                          {property.newCount !== undefined && property.newCount > 0 ? (
                            <Badge variant="secondary" className="min-w-6 justify-center">
                              {property.newCount}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {viewMode === "grid" && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property.name}
                  {...property}
                  onClick={() => onPropertyClick?.(property)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
