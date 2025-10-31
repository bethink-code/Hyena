import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { HyenaLogo } from "@/components/HyenaLogo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PROPERTIES } from "@/lib/properties";
import { TECHNICIAN_NAV } from "@/config/navigation";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from "date-fns";

type MaintenanceTask = {
  task: string;
  date: string;
  priority: "high" | "medium" | "low";
  equipment: string;
  status: "scheduled" | "overdue" | "completed";
  propertyId: string;
  propertyName: string;
};

export default function Schedule() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Use the first 3 properties for the technician's scope
  const technicianProperties = PROPERTIES.slice(0, 3);

  // Mock maintenance task data for each property
  const maintenanceTasksByProperty: Record<string, Array<{ task: string; date: string; priority: "high" | "medium" | "low"; equipment: string; status: "scheduled" | "overdue" | "completed" }>> = {
    "1": [
      { task: "Router Firmware Update", date: "15/10/2025", priority: "medium", equipment: "Main Router", status: "scheduled" },
      { task: "Access Point Inspection", date: "18/10/2025", priority: "low", equipment: "All APs", status: "scheduled" },
      { task: "Cable Infrastructure Check", date: "22/10/2025", priority: "medium", equipment: "Server Room", status: "scheduled" },
      { task: "Battery Backup Test", date: "25/10/2025", priority: "high", equipment: "UPS Systems", status: "scheduled" },
      { task: "Switch Maintenance", date: "05/10/2025", priority: "medium", equipment: "Main Switch", status: "completed" },
      { task: "Backup System Check", date: "01/10/2025", priority: "low", equipment: "Backup Router", status: "completed" },
      { task: "Network Security Audit", date: "30/10/2025", priority: "high", equipment: "All Systems", status: "scheduled" },
      { task: "Fiber Connection Test", date: "12/11/2025", priority: "medium", equipment: "Fiber Links", status: "scheduled" },
    ],
    "2": [
      { task: "Router Firmware Update", date: "08/10/2025", priority: "high", equipment: "Main Router", status: "overdue" },
      { task: "Access Point Inspection", date: "20/10/2025", priority: "low", equipment: "All APs", status: "scheduled" },
      { task: "Cable Infrastructure Check", date: "23/10/2025", priority: "medium", equipment: "Server Room", status: "scheduled" },
      { task: "Battery Backup Test", date: "09/10/2025", priority: "high", equipment: "UPS Systems", status: "overdue" },
      { task: "Switch Maintenance", date: "28/09/2025", priority: "medium", equipment: "Main Switch", status: "completed" },
      { task: "Load Balancer Check", date: "28/10/2025", priority: "medium", equipment: "Load Balancer", status: "scheduled" },
      { task: "VPN Gateway Update", date: "15/11/2025", priority: "high", equipment: "VPN Gateway", status: "scheduled" },
    ],
    "3": [
      { task: "Router Firmware Update", date: "05/10/2025", priority: "high", equipment: "Main Router", status: "overdue" },
      { task: "Access Point Inspection", date: "06/10/2025", priority: "medium", equipment: "All APs", status: "overdue" },
      { task: "Cable Infrastructure Check", date: "21/10/2025", priority: "medium", equipment: "Server Room", status: "scheduled" },
      { task: "Battery Backup Test", date: "03/10/2025", priority: "high", equipment: "UPS Systems", status: "overdue" },
      { task: "Switch Maintenance", date: "20/09/2025", priority: "low", equipment: "Main Switch", status: "completed" },
      { task: "Cooling System Check", date: "27/10/2025", priority: "medium", equipment: "HVAC", status: "scheduled" },
      { task: "Redundancy Test", date: "18/11/2025", priority: "high", equipment: "Backup Systems", status: "scheduled" },
    ],
  };

  // Flatten all tasks with property information
  const allTasks: MaintenanceTask[] = useMemo(() => {
    const tasks: MaintenanceTask[] = [];
    technicianProperties.forEach(property => {
      const propertyTasks = maintenanceTasksByProperty[property.id] || [];
      propertyTasks.forEach(task => {
        tasks.push({
          ...task,
          propertyId: property.id,
          propertyName: property.name,
        });
      });
    });
    return tasks;
  }, [technicianProperties]);

  // Parse date from DD/MM/YYYY to Date object
  const parseDate = (dateString: string): Date => {
    const [day, month, year] = dateString.split("/");
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };

  // Get calendar days for current month
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    
    // Get first day of the week (Sunday = 0)
    const startDay = monthStart.getDay();
    
    // Create array of dates for the month view
    const days: (Date | null)[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    days.push(...daysInMonth);
    
    return days;
  }, [currentMonth]);

  // Get tasks for a specific day
  const getTasksForDay = (day: Date): MaintenanceTask[] => {
    return allTasks.filter(task => {
      const taskDate = parseDate(task.date);
      return isSameDay(taskDate, day);
    });
  };

  // Calculate summary stats
  const stats = useMemo(() => {
    const today = new Date();
    const scheduled = allTasks.filter(t => t.status === "scheduled").length;
    const overdue = allTasks.filter(t => t.status === "overdue").length;
    const completed = allTasks.filter(t => t.status === "completed").length;
    const highPriority = allTasks.filter(t => t.priority === "high" && t.status !== "completed").length;
    
    return { scheduled, overdue, completed, highPriority };
  }, [allTasks]);

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium": return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20";
      case "low": return "bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "overdue": return "border-l-4 border-l-destructive";
      case "completed": return "border-l-4 border-l-green-500";
      case "scheduled": return "border-l-4 border-l-primary";
      default: return "";
    }
  };

  return (
    <AppLayout
      title="Preventive Maintenance"
      homeRoute="/technician"
      navSections={TECHNICIAN_NAV}
      sidebarHeader={<HyenaLogo />}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">Maintenance Schedule</h2>
          <p className="text-muted-foreground">Preventive maintenance calendar across all assigned properties</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Scheduled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.scheduled}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.overdue}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">High Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.highPriority}</div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {format(currentMonth, "MMMM yyyy")}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToToday}
                  data-testid="button-today"
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPreviousMonth}
                  data-testid="button-previous-month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToNextMonth}
                  data-testid="button-next-month"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardDescription>
              Click on tasks to view details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
              {/* Day headers */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="bg-muted p-2 text-center text-xs font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {calendarDays.map((day, index) => {
                const tasks = day ? getTasksForDay(day) : [];
                const isToday = day ? isSameDay(day, new Date()) : false;
                const isCurrentMonth = day ? isSameMonth(day, currentMonth) : false;
                
                return (
                  <div
                    key={index}
                    className={`bg-card min-h-24 p-2 ${
                      !day ? "bg-muted/50" : ""
                    } ${isToday ? "ring-2 ring-primary ring-inset" : ""}`}
                    data-testid={day ? `calendar-day-${format(day, "yyyy-MM-dd")}` : `calendar-empty-${index}`}
                  >
                    {day && (
                      <>
                        <div
                          className={`text-sm font-medium mb-1 ${
                            isToday
                              ? "text-primary font-bold"
                              : isCurrentMonth
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {format(day, "d")}
                        </div>
                        <div className="space-y-1">
                          {tasks.map((task, taskIndex) => (
                            <div
                              key={taskIndex}
                              className={`text-xs p-1 rounded border ${getStatusColor(task.status)} bg-card`}
                              data-testid={`task-${format(day, "yyyy-MM-dd")}-${taskIndex}`}
                            >
                              <div className="font-medium truncate" title={task.task}>
                                {task.task}
                              </div>
                              <div className="flex items-center gap-1 mt-0.5">
                                <Badge
                                  variant="outline"
                                  className={`text-xs px-1 py-0 h-4 ${getPriorityColor(task.priority)}`}
                                >
                                  {task.priority}
                                </Badge>
                                <span className="text-muted-foreground truncate" title={task.propertyName}>
                                  {task.propertyName}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t">
              <div className="text-sm font-medium mb-2">Legend</div>
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 bg-primary rounded"></div>
                  <span className="text-muted-foreground">Scheduled</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 bg-destructive rounded"></div>
                  <span className="text-muted-foreground">Overdue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 bg-green-500 rounded"></div>
                  <span className="text-muted-foreground">Completed</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
