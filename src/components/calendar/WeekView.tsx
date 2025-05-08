
import { Appointment } from "@/services/appointmentService";
import { format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { useMediaQuery } from "@/hooks/use-mobile";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WeekViewProps {
  days: Date[];
  appointments: Appointment[];
  openAppointmentDetails: (appointment: Appointment) => void;
  isLoading: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
}

const WeekView = ({
  days,
  appointments,
  openAppointmentDetails,
  isLoading,
  onNext,
  onPrevious
}: WeekViewProps) => {
  // Use media queries for responsive design
  const isSmallMobile = useMediaQuery("(max-width: 430px)");
  const isMediumMobile = useMediaQuery("(min-width: 431px) and (max-width: 639px)");
  const isLargeMobile = useMediaQuery("(min-width: 640px) and (max-width: 767px)");
  const isMobile = isSmallMobile || isMediumMobile || isLargeMobile;
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-[calc(100vh-170px)]">Cargando...</div>;
  }
  
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
  
  // Responsive grid columns based on number of days
  const getColumnClass = () => {
    const daysCount = days.length;
    if (daysCount <= 3) return 'grid-cols-3';
    if (daysCount <= 4) return 'grid-cols-4';
    if (daysCount <= 5) return 'grid-cols-5';
    return 'grid-cols-7';
  };
  
  return (
    <div className="flex flex-col">
      {isMobile && (
        <div className="flex justify-between items-center mb-2">
          <Button variant="outline" size="sm" onClick={onPrevious}>
            <ChevronLeft size={16} className="mr-1" />
            Anterior
          </Button>
          <Button variant="outline" size="sm" onClick={onNext}>
            Siguiente
            <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
      )}
      
      <div className={`grid ${getColumnClass()} gap-1 h-[calc(100vh-170px)] overflow-x-auto`}>
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
            <div key={index} className="flex flex-col h-full min-w-[120px]">
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
    </div>
  );
};

export default WeekView;
