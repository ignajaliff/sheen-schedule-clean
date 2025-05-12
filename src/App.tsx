
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { testSupabaseConnection } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "./components/Navbar";
import AppointmentsPage from "./pages/AppointmentsPage";
import CalendarPage from "./pages/CalendarPage";
import MetricsPage from "./pages/MetricsPage";
import ServicesPage from "./pages/ServicesPage";
import AccountingPage from "./pages/AccountingPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  useEffect(() => {
    // Test the connection to Supabase on app load
    testSupabaseConnection()
      .then((success) => {
        if (!success) {
          toast.error("Error de conexión con la base de datos. Por favor, intente más tarde.");
        }
      })
      .catch((error) => {
        console.error("Error testing Supabase connection:", error);
        toast.error("Error de conexión con la base de datos. Por favor, intente más tarde.");
      });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Navigate to="/appointments" replace />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/metrics" element={<MetricsPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/accounting" element={<AccountingPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
