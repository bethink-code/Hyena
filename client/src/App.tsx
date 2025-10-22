import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import LandingPage from "@/pages/LandingPage";
import GuestPortal from "@/pages/GuestPortal";
import ManagerDashboard from "@/pages/ManagerDashboard";
import AdminCenter from "@/pages/AdminCenter";
import TechnicianApp from "@/pages/TechnicianApp";
import EventSimulator from "@/pages/EventSimulator";

import ManagerIncidents from "@/pages/manager/IncidentQueue";
import ManagerNetwork from "@/pages/manager/NetworkStatus";
import ManagerAnalytics from "@/pages/manager/Analytics";
import ManagerReports from "@/pages/manager/Reports";
import ManagerMessages from "@/pages/manager/Messages";
import ManagerPropertyDetail from "@/pages/manager/PropertyDetail";

import TechnicianIncidents from "@/pages/technician/IncidentQueue";
import TechnicianPropertyDetail from "@/pages/technician/PropertyDetail";
import TechnicianCompleted from "@/pages/technician/CompletedJobs";
import TechnicianSchedule from "@/pages/technician/Schedule";
import TechnicianEquipment from "@/pages/technician/Equipment";

import AdminIncidents from "@/pages/admin/IncidentQueue";
import AdminProperties from "@/pages/admin/Properties";
import AdminPropertyDetail from "@/pages/admin/PropertyDetail";
import AdminUsers from "@/pages/admin/Users";
import AdminConfig from "@/pages/admin/Config";
import AdminIntegrations from "@/pages/admin/Integrations";
import AdminAnalytics from "@/pages/admin/Analytics";
import AdminReports from "@/pages/admin/Reports";
import AdminAudit from "@/pages/admin/Audit";

import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/guest" component={GuestPortal} />
      
      <Route path="/manager" component={ManagerDashboard} />
      <Route path="/manager/properties/:id" component={ManagerPropertyDetail} />
      <Route path="/manager/incidents" component={ManagerIncidents} />
      <Route path="/manager/network" component={ManagerNetwork} />
      <Route path="/manager/analytics" component={ManagerAnalytics} />
      <Route path="/manager/reports" component={ManagerReports} />
      <Route path="/manager/messages" component={ManagerMessages} />
      
      <Route path="/technician" component={TechnicianApp} />
      <Route path="/technician/incidents" component={TechnicianIncidents} />
      <Route path="/technician/properties/:id" component={TechnicianPropertyDetail} />
      <Route path="/technician/completed" component={TechnicianCompleted} />
      <Route path="/technician/schedule" component={TechnicianSchedule} />
      <Route path="/technician/equipment" component={TechnicianEquipment} />
      
      <Route path="/admin" component={AdminCenter} />
      <Route path="/admin/incidents" component={AdminIncidents} />
      <Route path="/admin/properties/:id" component={AdminPropertyDetail} />
      <Route path="/admin/properties" component={AdminProperties} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/config" component={AdminConfig} />
      <Route path="/admin/integrations" component={AdminIntegrations} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      <Route path="/admin/reports" component={AdminReports} />
      <Route path="/admin/audit" component={AdminAudit} />
      
      <Route path="/simulator" component={EventSimulator} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
