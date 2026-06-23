import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/feedback/sonner";
import { Toaster } from "@/components/ui/feedback/toaster";
import { TooltipProvider } from "@/components/ui/feedback/tooltip";
import { DeliveryProvider } from "@/lib/deliveryStore";
import { SidebarProvider } from "@/context/SidebarContext";
import { UserProvider } from "@/context/UserProvider";
import { NotificationProvider } from "@/context/NotificationContext";
import Index from "./pages/Index.tsx";
import RequestDelivery from "./pages/RequestDelivery.tsx";
import TrackDelivery from "./pages/TrackDelivery.tsx";
import DeliveryHistory from "./pages/DeliveryHistory.tsx";
import RobotFleet from "./pages/RobotFleet.tsx";
import Documents from "./pages/Documents.tsx";
import SettingsPage from "./pages/Settings.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import Notifications from "./pages/Notifications.tsx";
import DeliveryInbox from "./pages/DeliveryInbox.tsx";
import AdminPanel from "./pages/AdminPanel.tsx";
import { useUserProvider } from "@/context/UserProvider";
import { useUser } from "@/hooks/useUser";


const queryClient = new QueryClient();

// Protected route wrapper - redirects to login if not authenticated
const ProtectedRoute = ({ element }: { element: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  return token ? element : <Navigate to="/login" replace />;
};

const AdminRoute = ({ element }: { element: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  const { isInitialized } = useUserProvider();
  const { user } = useUser();

  if (!token) return <Navigate to="/login" replace />;
  if (!isInitialized) return <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">Loading admin panel...</div>;
  if (user?.role !== "admin") return <Navigate to="/" replace />;

  return element;
};

const App = () => (
  <SidebarProvider>
    <QueryClientProvider client={queryClient}>
      <DeliveryProvider>
        <UserProvider>
          <NotificationProvider>          
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<ProtectedRoute element={<Index />} />} />
                <Route path="/request" element={<ProtectedRoute element={<RequestDelivery />} />} />
                <Route path="/track" element={<ProtectedRoute element={<TrackDelivery />} />} />
                <Route path="/track/:deliveryId" element={<ProtectedRoute element={<TrackDelivery />} />} />
                <Route path="/history" element={<ProtectedRoute element={<DeliveryHistory />} />} />
                <Route path="/robots" element={<ProtectedRoute element={<RobotFleet />} />} />
                <Route path="/documents" element={<ProtectedRoute element={<Documents />} />} />
                <Route path="/settings" element={<ProtectedRoute element={<SettingsPage />} />} />
                <Route path="/notifications" element={<ProtectedRoute element={<Notifications />} />} />
                <Route path="/delivery-inbox" element={<ProtectedRoute element={<DeliveryInbox />} />} />
                <Route path="/admin" element={<AdminRoute element={<AdminPanel />} />} />
              </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </NotificationProvider>         
        </UserProvider>
      </DeliveryProvider>
    </QueryClientProvider>
  </SidebarProvider>
)

export default App;