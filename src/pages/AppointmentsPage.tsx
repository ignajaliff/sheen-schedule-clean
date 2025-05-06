
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import AppointmentCard from "@/components/AppointmentCard";
import Header from "@/components/Header";
import { getAppointmentsByStatus, Appointment } from "@/services/appointmentService";
import { toast } from "sonner";

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  
  useEffect(() => {
    const loadAppointments = async () => {
      setIsLoading(true);
      try {
        const appointmentsData = await getAppointmentsByStatus(activeTab);
        setAppointments(appointmentsData);
      } catch (error) {
        toast.error("Error al cargar los turnos");
        console.error("Error loading appointments:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAppointments();
  }, [activeTab, refreshKey]);
  
  const handleAppointmentUpdated = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  return (
    <div className="pb-20 md:pb-5 md:pl-20">
      <Header title="Turnos Agendados" />
      
      <main className="pt-20 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 md:w-[400px]">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="pending">Pendientes</TabsTrigger>
            <TabsTrigger value="completed">Completados</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelados</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-6">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-4 pr-4">
                {isLoading ? (
                  <p className="text-center py-4">Cargando turnos...</p>
                ) : appointments.length === 0 ? (
                  <p className="text-center py-4 text-gray-500">No hay turnos para mostrar</p>
                ) : (
                  appointments.map((appointment) => (
                    <AppointmentCard 
                      key={appointment.id} 
                      appointment={appointment}
                      onStatusUpdated={handleAppointmentUpdated}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AppointmentsPage;
