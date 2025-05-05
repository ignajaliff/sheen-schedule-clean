
import { useState, useEffect } from "react";
import { PlusIcon, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppointmentCard from "@/components/AppointmentCard";
import Header from "@/components/Header";
import AppointmentForm from "@/components/AppointmentForm";
import { getAppointments, Appointment, updateAppointmentStatus } from "@/services/appointmentService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

const AppointmentsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  
  useEffect(() => {
    // Cargar los turnos cada vez que refreshKey cambie
    setAppointments(getAppointments());
  }, [refreshKey]);
  
  const filteredAppointments = appointments.filter(app => {
    const matchesSearch = app.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openAppointmentDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleAppointmentAdded = () => {
    // Actualizar la lista de turnos
    setRefreshKey(prevKey => prevKey + 1);
  };

  const handleStatusUpdate = (id: string, status: "completed" | "cancelled") => {
    const updatedAppointment = updateAppointmentStatus(id, status);
    
    if (updatedAppointment) {
      setRefreshKey(prevKey => prevKey + 1);
      setSelectedAppointment(null);
      
      if (status === "completed") {
        toast.success("Turno completado correctamente");
      } else {
        toast.info("Turno cancelado");
      }
    }
  };

  return (
    <div className="pb-20 md:pb-5 md:pl-20">
      <Header title="Turnos" />
      
      <main className="pt-20 px-4 max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Buscar cliente..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center">
            <Filter size={18} className="mr-2 text-gray-500" />
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="completed">Completados</SelectItem>
                <SelectItem value="cancelled">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="my-4">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                id={appointment.id}
                clientName={appointment.clientName}
                date={appointment.date}
                time={appointment.time}
                serviceType={appointment.serviceType}
                location={appointment.location}
                isHomeService={appointment.isHomeService}
                status={appointment.status}
                onClick={() => openAppointmentDetails(appointment)}
              />
            ))
          ) : (
            <div className="text-center py-10 text-gray-500">
              <p className="text-lg">No se encontraron turnos</p>
              <p className="text-sm">Intenta con otros filtros o agrega un nuevo turno</p>
            </div>
          )}
        </div>
        
        <Button 
          className="fixed right-4 bottom-20 md:bottom-4 bg-cleanly-blue hover:bg-blue-700 shadow-lg rounded-full w-14 h-14 p-0"
          onClick={() => setIsFormOpen(true)}
        >
          <PlusIcon size={24} />
        </Button>
        
        {/* Modal para ver detalles del turno */}
        <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
          {selectedAppointment && (
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-xl">Detalles del Turno</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Cliente</h3>
                  <p className="text-lg">{selectedAppointment.clientName}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Fecha</h3>
                    <p>{selectedAppointment.date}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Hora</h3>
                    <p>{selectedAppointment.time}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Servicio</h3>
                  <p>{selectedAppointment.serviceType}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Lugar</h3>
                  <p>{selectedAppointment.isHomeService ? "Domicilio" : "Taller"}</p>
                </div>
                
                {selectedAppointment.isHomeService && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Dirección</h3>
                    <p>{selectedAppointment.location}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Estado</h3>
                  <p className="capitalize">
                    {selectedAppointment.status === "pending" && "Pendiente"}
                    {selectedAppointment.status === "completed" && "Completado"}
                    {selectedAppointment.status === "cancelled" && "Cancelado"}
                  </p>
                </div>
              </div>
              
              <DialogFooter className="gap-2 sm:gap-0">
                {selectedAppointment.status === "pending" && (
                  <>
                    <Button 
                      variant="outline" 
                      className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                      onClick={() => handleStatusUpdate(selectedAppointment.id, "cancelled")}
                    >
                      Cancelar Turno
                    </Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleStatusUpdate(selectedAppointment.id, "completed")}
                    >
                      Marcar Completado
                    </Button>
                  </>
                )}
                {(selectedAppointment.status === "completed" || selectedAppointment.status === "cancelled") && (
                  <Button variant="outline" onClick={() => setSelectedAppointment(null)}>
                    Cerrar
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>
        
        {/* Formulario para nuevo turno */}
        <AppointmentForm 
          open={isFormOpen} 
          onClose={() => setIsFormOpen(false)}
          onAppointmentAdded={handleAppointmentAdded}
        />
      </main>
    </div>
  );
};

export default AppointmentsPage;
