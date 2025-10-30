import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown, ArrowUp, ArrowDown, Download, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export interface ColumnDef<T> {
  id: string;
  label: string;
  accessor: (row: T) => any;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface FilterDef {
  id: string;
  label: string;
  options: { value: string; label: string }[];
}

interface ReportDataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  filters?: FilterDef[];
  searchPlaceholder?: string;
  exportFileName?: string;
  isLoading?: boolean;
}

export function ReportDataTable<T>({
  data,
  columns,
  filters = [],
  searchPlaceholder = "Search...",
  exportFileName = "report",
  isLoading = false,
}: ReportDataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    column: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  const handleSort = (columnId: string) => {
    setSortConfig((current) => {
      if (!current || current.column !== columnId) {
        return { column: columnId, direction: "asc" };
      }
      if (current.direction === "asc") {
        return { column: columnId, direction: "desc" };
      }
      return null;
    });
  };

  const getSortIcon = (columnId: string) => {
    if (!sortConfig || sortConfig.column !== columnId) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Apply search filter
    if (searchTerm) {
      result = result.filter((row) =>
        columns.some((col) => {
          const value = col.accessor(row);
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply column filters
    Object.entries(filterValues).forEach(([filterId, filterValue]) => {
      if (filterValue && filterValue !== "all") {
        result = result.filter((row) => {
          const column = columns.find((col) => col.id === filterId);
          if (!column) return true;
          const value = column.accessor(row);
          return String(value).toLowerCase() === filterValue.toLowerCase();
        });
      }
    });

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const column = columns.find((col) => col.id === sortConfig.column);
        if (!column) return 0;

        const aValue = column.accessor(a);
        const bValue = column.accessor(b);

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        let comparison = 0;
        if (typeof aValue === "number" && typeof bValue === "number") {
          comparison = aValue - bValue;
        } else {
          comparison = String(aValue).localeCompare(String(bValue));
        }

        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [data, columns, searchTerm, filterValues, sortConfig]);

  const handleExport = () => {
    // Create CSV content
    const headers = columns.map((col) => col.label).join(",");
    const rows = filteredAndSortedData.map((row) =>
      columns.map((col) => {
        const value = col.accessor(row);
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(",")
    );
    const csv = [headers, ...rows].join("\n");

    // Download
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${exportFileName}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              data-testid="input-search"
            />
          </div>
        </div>

        {filters.map((filter) => (
          <Select
            key={filter.id}
            value={filterValues[filter.id] || "all"}
            onValueChange={(value) =>
              setFilterValues((prev) => ({ ...prev, [filter.id]: value }))
            }
          >
            <SelectTrigger className="w-[180px]" data-testid={`select-${filter.id}`}>
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {filter.label}</SelectItem>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        <Button
          variant="outline"
          onClick={handleExport}
          disabled={filteredAndSortedData.length === 0}
          data-testid="button-export"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column.id} data-testid={`header-${column.id}`}>
                      {column.sortable ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort(column.id)}
                          className="h-8 px-2 hover-elevate"
                          data-testid={`button-sort-${column.id}`}
                        >
                          {column.label}
                          <span className="ml-2">{getSortIcon(column.id)}</span>
                        </Button>
                      ) : (
                        column.label
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredAndSortedData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No data found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedData.map((row, index) => (
                    <TableRow key={index} data-testid={`row-${index}`}>
                      {columns.map((column) => {
                        const value = column.accessor(row);
                        return (
                          <TableCell key={column.id} data-testid={`cell-${column.id}-${index}`}>
                            {column.render ? column.render(value, row) : value}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground">
        Showing {filteredAndSortedData.length} of {data.length} records
      </div>
    </div>
  );
}
