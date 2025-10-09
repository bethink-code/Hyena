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
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/guest" component={GuestPortal} />
      <Route path="/manager" component={ManagerDashboard} />
      <Route path="/admin" component={AdminCenter} />
      <Route path="/technician" component={TechnicianApp} />
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
