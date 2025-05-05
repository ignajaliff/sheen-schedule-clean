
import { useState } from "react";
import { format, startOfWeek, endOfWeek, startOfDay, addDays, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import AppointmentForm from "@/components/AppointmentForm";
import { getAppointments, Appointment } from "@/services/appointmentService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [activeView, setActiveView] = useState("week");
  
  const appointments = getAppointments();
  
  const getDaysOfWeek = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
    
    const days = [];
    let day = start;
    
    while (day <= end) {
      days.push(day);
      day = addDays(day, 1);
    }
    
    return days;
  };
  
  const getAppointmentsForDay = (date: Date) => {
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
  
  // Renderizar la vista de semana
  const renderWeekView = () => {
    const days = getDaysOfWeek();
    
    return (
      <div className="grid grid-cols-7 gap-2 h-[calc(100vh-170px)]">
        {days.map((day, index) => (
          <div key={index} className="flex flex-col h-full">
            <div className="text-center py-2 border-b sticky top-0 bg-white">
              <p className="text-sm font-medium">{format(day, 'EEE', { locale: es })}</p>
              <p className="text-lg">{format(day, 'd')}</p>
            </div>
            
            <div className="flex-grow overflow-y-auto p-1">
              {getAppointmentsForDay(day).map((appointment) => (
                <div 
                  key={appointment.id}
                  className={`mb-2 p-2 text-xs border-l-4 rounded cursor-pointer ${getAppointmentColor(appointment.status)}`}
                  onClick={() => openAppointmentDetails(appointment)}
                >
                  <p className="font-medium truncate">{appointment.clientName}</p>
                  <p className="text-gray-600">{appointment.time}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Renderizar la vista de día
  const renderDayView = () => {
    const appointments = getAppointmentsForDay(selectedDate);
    const hours = Array.from({ length: 10 }, (_, i) => i + 9); // 9:00 - 18:00
    
    return (
      <div className="flex flex-col h-[calc(100vh-170px)] overflow-y-auto">
        <div className="text-center py-4 border-b sticky top-0 bg-white">
          <p className="text-xl font-medium">{format(selectedDate, 'EEEE d MMMM', { locale: es })}</p>
        </div>
        
        {hours.map((hour) => (
          <div key={hour} className="border-b py-2">
            <div className="flex">
              <div className="w-16 text-right pr-4 text-gray-500">{`${hour}:00`}</div>
              <div className="flex-grow">
                {appointments
                  .filter(app => {
                    const [appHour] = app.time.split(':');
                    return parseInt(appHour) === hour;
                  })
                  .map(appointment => (
                    <div 
                      key={appointment.id}
                      className={`mb-2 p-2 rounded border-l-4 cursor-pointer ${getAppointmentColor(appointment.status)}`}
                      onClick={() => openAppointmentDetails(appointment)}
                    >
                      <p className="font-medium">{appointment.clientName}</p>
                      <p className="text-sm text-gray-600">{appointment.time} - {appointment.serviceType}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
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
                    <Button variant="outline" className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200">
                      Cancelar Turno
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700">
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
        />
      </main>
    </div>
  );
};

export default CalendarPage;
