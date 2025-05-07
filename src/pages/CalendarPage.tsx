import { useState, useEffect } from "react";
import { format, startOfWeek, endOfWeek, startOfDay, addDays, isSameDay, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import AppointmentForm from "@/components/AppointmentForm";
import { getAppointments, Appointment, updateAppointmentStatus } from "@/services/appointmentService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useIsMobile, useMediaQuery } from "@/hooks/use-mobile";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [activeView, setActiveView] = useState("week");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Use more granular breakpoints for better responsive design
  const isMobile = useIsMobile();
  const isSmallMobile = useMediaQuery("(max-width: 430px)");
  const isMediumMobile = useMediaQuery("(min-width: 431px) and (max-width: 639px)");
  const isLargeMobile = useMediaQuery("(min-width: 640px) and (max-width: 767px)");
  
  // Determine how many days to show based on screen size
  const getDaysToShow = () => {
    if (isSmallMobile) return 2; // Smallest screens: 2 days
    if (isMediumMobile) return 3; // Medium mobile: 3 days
    if (isLargeMobile) return 4; // Larger mobile devices: 4 days
    return 7; // Desktop: Full week
  };
  
  useEffect(() => {
    const loadAppointments = async () => {
      setIsLoading(true);
      try {
        const appointmentsData = await getAppointments();
        setAppointments(appointmentsData);
      } catch (error) {
        toast.error("Error al cargar los turnos");
        console.error("Error loading appointments:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAppointments();
  }, [refreshKey]);
  
  const getDaysOfWeek = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const daysToShow = getDaysToShow();
    const end = isMobile 
      ? addDays(start, daysToShow - 1) // Show only the calculated number of days on mobile
      : endOfWeek(selectedDate, { weekStartsOn: 1 });
    
    const days = [];
    let day = start;
    
    while (day <= end) {
      days.push(day);
      day = addDays(day, 1);
    }
    
    return days;
  };
  
  const getAppointmentsForDay = (date: Date) => {
    if (!appointments || !Array.isArray(appointments)) return [];
    
    return appointments.filter(appointment => {
      const [day, month, year] = appointment.date.split('/');
      const appointmentDate = new Date(Number(year), Number(month) - 1, Number(day));
      return isSameDay(appointmentDate, date);
    });
  };

  const getAppointmentColor = (status: string) => {
    switch(status) {
      case "pending":
        return "border-l-yellow-500 bg-yellow-50";
      case "completed":
        return "border-l-green-500 bg-green-50";
      case "cancelled":
        return "border-l-red-500 bg-red-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

  const openAppointmentDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };
  
  const handleAppointmentAdded = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  const handleStatusUpdate = async (id: string, status: "completed" | "cancelled") => {
    try {
      const updatedAppointment = await updateAppointmentStatus(id, status);
      
      if (updatedAppointment) {
        setRefreshKey(prevKey => prevKey + 1);
        setSelectedAppointment(null);
        
        if (status === "completed") {
          toast.success("Turno completado correctamente");
        } else {
          toast.info("Turno cancelado");
        }
      }
    } catch (error) {
      toast.error("Error al actualizar el estado del turno");
      console.error("Error updating appointment status:", error);
    }
  };
  
  // Renderizar la vista de semana
  const renderWeekView = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-[calc(100vh-170px)]">Cargando...</div>;
    }
    
    const days = getDaysOfWeek();
    // Responsive grid columns based on number of days
    const columnClass = isMobile 
      ? isSmallMobile 
        ? 'grid-cols-2' 
        : isMediumMobile 
          ? 'grid-cols-3' 
          : 'grid-cols-4'
      : 'grid-cols-7';
    
    return (
      <div className={`grid ${columnClass} gap-1 h-[calc(100vh-170px)]`}>
        {days.map((day, index) => {
          const dayAppointments = getAppointmentsForDay(day);
          // Agrupar citas por hora
          const appointmentsByHour: Record<string, Appointment[]> = {};
          
          dayAppointments.forEach(appointment => {
            const hourKey = appointment.time.split(':')[0];
            if (!appointmentsByHour[hourKey]) {
              appointmentsByHour[hourKey] = [];
            }
            appointmentsByHour[hourKey].push(appointment);
          });
          
          return (
            <div key={index} className="flex flex-col h-full">
              <div className="text-center py-2 border-b sticky top-0 bg-white shadow-sm z-10">
                <p className="text-sm font-medium">{format(day, 'EEE', { locale: es })}</p>
                <p className="text-lg">{format(day, 'd')}</p>
              </div>
              
              <div className="flex-grow overflow-y-auto p-1">
                {Object.entries(appointmentsByHour).map(([hour, appointments]) => (
                  <div key={hour} className="relative mb-3">
                    {appointments.map((appointment, appIndex) => (
                      <div 
                        key={appointment.id}
                        className={`mb-2 p-2 text-xs md:text-sm border-l-4 rounded cursor-pointer 
                          ${getAppointmentColor(appointment.status)} 
                          ${appIndex > 0 ? 'relative -mt-1 ml-2 shadow-md' : ''}`}
                        style={{ 
                          zIndex: appIndex + 1,
                          marginTop: appIndex > 0 ? '-4px' : '0' 
                        }}
                        onClick={() => openAppointmentDetails(appointment)}
                      >
                        <p className="font-medium truncate">{appointment.clientName}</p>
                        <p className="text-gray-600">{appointment.time}</p>
                        <p className="text-xs truncate">{appointment.serviceType}</p>
                        {appIndex > 0 && (
                          <span className="absolute top-0 right-1 -mt-1 text-[10px] bg-blue-100 text-blue-700 px-1 rounded-sm">
                            +1
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  // Renderizar la vista de día
  const renderDayView = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-[calc(100vh-170px)]">Cargando...</div>;
    }
    
    const appointmentsForDay = getAppointmentsForDay(selectedDate);
    const hours = Array.from({ length: 10 }, (_, i) => i + 9); // 9:00 - 18:00
    
    // Agrupar citas por hora
    const appointmentsByHour: Record<string, Appointment[]> = {};
    
    appointmentsForDay.forEach(appointment => {
      const hour = appointment.time.split(':')[0];
      if (!appointmentsByHour[hour]) {
        appointmentsByHour[hour] = [];
      }
      appointmentsByHour[hour].push(appointment);
    });
    
    return (
      <div className="flex flex-col h-[calc(100vh-170px)] overflow-y-auto">
        <div className="text-center py-4 border-b sticky top-0 bg-white">
          <p className="text-xl font-medium">{format(selectedDate, 'EEEE d MMMM', { locale: es })}</p>
        </div>
        
        {hours.map((hour) => (
          <div key={hour} className="border-b py-2">
            <div className="flex">
              <div className="w-16 text-right pr-4 text-gray-500">{`${hour}:00`}</div>
              <div className="flex-grow relative">
                {appointmentsByHour[hour.toString()] && appointmentsByHour[hour.toString()].map((appointment, index) => (
                  <div 
                    key={appointment.id}
                    className={`p-2 rounded border-l-4 cursor-pointer ${getAppointmentColor(appointment.status)}`}
                    style={{ 
                      zIndex: index + 1,
                      position: 'relative',
                      marginTop: index > 0 ? '-8px' : '0',
                      marginLeft: index > 0 ? '12px' : '0',
                      boxShadow: index > 0 ? '0 2px 5px rgba(0,0,0,0.1)' : 'none'
                    }}
                    onClick={() => openAppointmentDetails(appointment)}
                  >
                    <p className="font-medium">{appointment.clientName}</p>
                    <p className="text-sm text-gray-600">{appointment.time} - {appointment.serviceType}</p>
                    {index > 0 && (
                      <div className="absolute top-0 right-1 -mt-1 bg-blue-100 text-blue-700 rounded px-1 py-0.5 text-xs inline-block">
                        Compartido
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Improved navigation buttons for mobile view
  const handlePrevDays = () => {
    const daysToMove = getDaysToShow();
    setSelectedDate(prevDate => subDays(prevDate, daysToMove));
  };

  const handleNextDays = () => {
    const daysToMove = getDaysToShow();
    setSelectedDate(prevDate => addDays(prevDate, daysToMove));
  };

  return (
    <div className="pb-20 md:pb-5 md:pl-20">
      <Header title="Calendario" />
      
      <main className="pt-20 px-2">
        <Tabs 
          defaultValue="week" 
          value={activeView} 
          onValueChange={setActiveView}
          className="w-full"
        >
          <div className="flex justify-between items-center px-2 mb-4">
            <TabsList>
              <TabsTrigger value="day">Día</TabsTrigger>
              <TabsTrigger value="week">Semana</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              {isMobile && activeView === "week" && (
                <>
                  <Button variant="outline" size="sm" onClick={handlePrevDays}>
                    <ChevronLeftIcon size={16} className="mr-1" />
                    {isSmallMobile ? '' : 'Anterior'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleNextDays}>
                    {isSmallMobile ? '' : 'Siguiente'}
                    <ChevronRightIcon size={16} className="ml-1" />
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={() => setSelectedDate(new Date())}>
                Hoy
              </Button>
            </div>
          </div>
          
          <TabsContent value="day" className="mt-0">
            {renderDayView()}
          </TabsContent>
          
          <TabsContent value="week" className="mt-0">
            {renderWeekView()}
          </TabsContent>
        </Tabs>
        
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

export default CalendarPage;
