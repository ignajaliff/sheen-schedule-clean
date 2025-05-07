
import { format, addDays, subDays, isSameDay } from "date-fns";
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import AppointmentForm from "@/components/AppointmentForm";
import { Appointment } from "@/services/appointmentService";
import useCalendar from "@/hooks/use-calendar";
import WeekView from "@/components/calendar/WeekView";
import DayView from "@/components/calendar/DayView";
import AppointmentDetails from "@/components/calendar/AppointmentDetails";

const CalendarPage = () => {
  const {
    selectedDate,
    setSelectedDate,
    isFormOpen,
    setIsFormOpen,
    selectedAppointment,
    setSelectedAppointment,
    activeView,
    setActiveView,
    appointments,
    isLoading,
    isMobile,
    isSmallMobile,
    getDaysToShow,
    getDaysOfWeek,
    handleAppointmentAdded,
    openAppointmentDetails
  } = useCalendar();

  // Get appointments for a specific day
  const getAppointmentsForDay = (date: Date) => {
    if (!appointments || !Array.isArray(appointments)) return [];
    
    return appointments.filter(appointment => {
      const [day, month, year] = appointment.date.split('/');
      const appointmentDate = new Date(Number(year), Number(month) - 1, Number(day));
      return isSameDay(appointmentDate, date);
    });
  };

  // Navigation handlers
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
            <DayView
              selectedDate={selectedDate}
              appointmentsForDay={getAppointmentsForDay(selectedDate)}
              openAppointmentDetails={openAppointmentDetails}
              isLoading={isLoading}
            />
          </TabsContent>
          
          <TabsContent value="week" className="mt-0">
            <WeekView
              days={getDaysOfWeek()}
              appointments={appointments}
              openAppointmentDetails={openAppointmentDetails}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
        
        <Button 
          className="fixed right-4 bottom-20 md:bottom-4 bg-cleanly-blue hover:bg-blue-700 shadow-lg rounded-full w-14 h-14 p-0"
          onClick={() => setIsFormOpen(true)}
        >
          <PlusIcon size={24} />
        </Button>
        
        {/* Modal para ver detalles del turno */}
        <AppointmentDetails
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onStatusUpdated={handleAppointmentAdded}
        />
        
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
