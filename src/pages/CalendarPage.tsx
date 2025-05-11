
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Calendar as CalendarIconFull } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import WeekView from "@/components/calendar/WeekView";
import DayView from "@/components/calendar/DayView";
import AppointmentForm from "@/components/AppointmentForm";
import AppointmentDetails from "@/components/calendar/AppointmentDetails";
import { useCalendar } from "@/hooks/use-calendar";
import Header from "@/components/Header";

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
    getDaysOfWeek,
    handleAppointmentAdded,
    openAppointmentDetails,
    goToNextWeek,
    goToPreviousWeek,
    goToNextDays,
    goToPreviousDays,
    goToToday
  } = useCalendar();
  
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  const currentWeekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const daysOfWeek = getDaysOfWeek();
  
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setCalendarOpen(false);
    }
  };
  
  const navigateNext = () => {
    if (isMobile && activeView !== "fullWeek") {
      goToNextDays();
    } else {
      goToNextWeek();
    }
  };
  
  const navigatePrevious = () => {
    if (isMobile && activeView !== "fullWeek") {
      goToPreviousDays();
    } else {
      goToPreviousWeek();
    }
  };
  
  const getDateRangeDisplay = () => {
    if (daysOfWeek.length > 0) {
      const start = daysOfWeek[0];
      const end = daysOfWeek[daysOfWeek.length - 1];
      
      if (daysOfWeek.length === 1) {
        return format(start, "d 'de' MMMM yyyy", { locale: es });
      }
      
      if (start.getMonth() === end.getMonth()) {
        return `${format(start, "d", { locale: es })}-${format(end, "d 'de' MMMM yyyy", { locale: es })}`;
      } else {
        return `${format(start, "d 'de' MMMM", { locale: es })} - ${format(end, "d 'de' MMMM yyyy", { locale: es })}`;
      }
    }
    return "";
  };
    
  return (
    <div className="min-h-screen pb-20 md:pb-5 md:pl-20">
      <Header title="Calendario" />
      
      <main className="pt-20 px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={navigatePrevious}>
              <ChevronLeft className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Anterior</span>
            </Button>
            
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="min-w-[150px] justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  <span className="truncate">{getDateRangeDisplay()}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateChange}
                  locale={es}
                />
              </PopoverContent>
            </Popover>
            
            <Button variant="outline" onClick={navigateNext}>
              <span className="mr-1 hidden sm:inline">Siguiente</span>
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button variant="outline" onClick={goToToday}>
              <CalendarIconFull className="mr-1 h-4 w-4" />
              <span>Hoy</span>
            </Button>
          </div>
          
          {isMobile && (
            <Tabs value={activeView} onValueChange={setActiveView} className="w-full md:w-auto">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="week">Semana</TabsTrigger>
                <TabsTrigger value="fullWeek">Semana Completa</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
          
          <Button 
            onClick={() => setIsFormOpen(true)}
            className="w-full md:w-auto"
          >
            Nuevo Turno
          </Button>
        </div>
        
        <ScrollArea className="h-[calc(100vh-170px)]">
          <WeekView 
            days={daysOfWeek}
            appointments={appointments}
            isLoading={isLoading}
            onAppointmentClick={openAppointmentDetails}
          />
        </ScrollArea>
      </main>
      
      <AppointmentForm 
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onAppointmentAdded={handleAppointmentAdded}
      />
      
      <AppointmentDetails
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onStatusUpdated={handleAppointmentAdded}
      />
    </div>
  );
};

export default CalendarPage;
