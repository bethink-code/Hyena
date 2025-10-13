import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PriorityBadge, type Priority } from "./PriorityBadge";
import { StatusBadge, type IncidentStatus } from "./StatusBadge";
import type { IncidentCardProps } from "./IncidentCard";

interface IncidentTableProps {
  incidents: IncidentCardProps[];
  onIncidentClick?: (incidentId: string) => void;
}

export function IncidentTable({ incidents, onIncidentClick }: IncidentTableProps) {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {incidents.map((incident) => (
            <TableRow
              key={incident.id}
              className="cursor-pointer hover-elevate"
              onClick={() => onIncidentClick?.(incident.id)}
              data-testid={`table-row-${incident.id}`}
            >
              <TableCell className="font-medium">
                <div>
                  <div className="font-semibold">{incident.title}</div>
                  <div className="text-sm text-muted-foreground line-clamp-1">
                    {incident.description}
                  </div>
                </div>
              </TableCell>
              <TableCell>{incident.location || "-"}</TableCell>
              <TableCell>
                <PriorityBadge priority={incident.priority} />
              </TableCell>
              <TableCell>
                <StatusBadge status={incident.status} />
              </TableCell>
              <TableCell>{incident.assignedTo || "-"}</TableCell>
              <TableCell className="font-mono text-sm">
                {incident.timestamp}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
