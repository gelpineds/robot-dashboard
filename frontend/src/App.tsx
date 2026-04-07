import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import RequestDelivery from "./pages/RequestDelivery.tsx";
import TrackDelivery from "./pages/TrackDelivery.tsx";
import DeliveryHistory from "./pages/DeliveryHistory.tsx";
import RobotFleet from "./pages/RobotFleet.tsx";
import Documents from "./pages/Documents.tsx";
import SettingsPage from "./pages/Settings.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/request" element={<RequestDelivery />} />
          <Route path="/track" element={<TrackDelivery />} />
          <Route path="/history" element={<DeliveryHistory />} />
          <Route path="/robots" element={<RobotFleet />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
