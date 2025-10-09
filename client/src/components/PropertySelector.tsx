import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2 } from "lucide-react";
import { useState } from "react";

interface Property {
  id: string;
  name: string;
  location: string;
}

interface PropertySelectorProps {
  properties: Property[];
  onPropertyChange?: (propertyId: string) => void;
  className?: string;
}

export function PropertySelector({
  properties,
  onPropertyChange,
  className,
}: PropertySelectorProps) {
  const [selectedProperty, setSelectedProperty] = useState(properties[0]?.id || "");

  const handleChange = (value: string) => {
    setSelectedProperty(value);
    onPropertyChange?.(value);
    console.log("Property changed to:", value);
  };

  const selected = properties.find((p) => p.id === selectedProperty);

  return (
    <div className={className}>
      <Select value={selectedProperty} onValueChange={handleChange}>
        <SelectTrigger className="w-full" data-testid="select-property">
          <div className="flex items-center gap-2 w-full min-w-0">
            <Building2 className="h-4 w-4 flex-shrink-0" />
            {selected ? (
              <div className="flex flex-col items-start text-left gap-0 min-w-0 flex-1">
                <span className="font-medium truncate w-full">{selected.name}</span>
                <span className="text-xs text-muted-foreground truncate w-full">{selected.location}</span>
              </div>
            ) : (
              <SelectValue placeholder="Select property" />
            )}
          </div>
        </SelectTrigger>
        <SelectContent>
          {properties.map((property) => (
            <SelectItem key={property.id} value={property.id} data-testid={`select-property-${property.id}`}>
              <div className="flex flex-col">
                <span className="font-medium">{property.name}</span>
                <span className="text-xs text-muted-foreground">{property.location}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
