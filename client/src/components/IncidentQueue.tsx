import { IncidentCard, type IncidentCardProps } from "./IncidentCard";
import { IncidentTable } from "./IncidentTable";
import { IncidentGrid } from "./IncidentGrid";
import { ViewSwitcher, type ViewMode } from "./ViewSwitcher";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useState } from "react";

export interface Property {
  id: string;
  name: string;
}

interface IncidentQueueProps {
  incidents: IncidentCardProps[];
  onIncidentClick?: (incidentId: string) => void;
  className?: string;
  properties?: Property[];
  selectedPropertyId?: string;
  onPropertyChange?: (propertyId: string) => void;
  showPropertyFilter?: boolean;
}

export function IncidentQueue({ 
  incidents, 
  onIncidentClick, 
  className,
  properties = [],
  selectedPropertyId,
  onPropertyChange,
  showPropertyFilter = false,
}: IncidentQueueProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("card");

  // Apply filters
  const filteredIncidents = incidents.filter(incident => {
    // Search filter
    const matchesSearch = searchTerm === "" || 
      incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === "all" || incident.status === statusFilter;
    
    // Priority filter
    const matchesPriority = priorityFilter === "all" || incident.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className={className}>
      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-start sm:items-center flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search incidents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-search"
          />
        </div>

        {showPropertyFilter && properties.length > 0 && (
          <Select 
            value={selectedPropertyId || "all"} 
            onValueChange={onPropertyChange}
          >
            <SelectTrigger className="w-full sm:w-48" data-testid="select-property-filter">
              <SelectValue placeholder="All Properties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40" data-testid="select-status-filter">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-40" data-testid="select-priority-filter">
            <SelectValue placeholder="All Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        
        <ViewSwitcher view={viewMode} onViewChange={setViewMode} />
      </div>

      {filteredIncidents.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No incidents found matching your filters
        </div>
      ) : (
        <>
          {viewMode === "card" && (
            <div className="space-y-3">
              {filteredIncidents.map((incident) => (
                <IncidentCard
                  key={incident.id}
                  {...incident}
                  onView={() => onIncidentClick?.(incident.id)}
                />
              ))}
            </div>
          )}

          {viewMode === "table" && (
            <IncidentTable incidents={filteredIncidents} onIncidentClick={onIncidentClick} />
          )}

          {viewMode === "grid" && (
            <IncidentGrid incidents={filteredIncidents} onIncidentClick={onIncidentClick} />
          )}
        </>
      )}
    </div>
  );
}
