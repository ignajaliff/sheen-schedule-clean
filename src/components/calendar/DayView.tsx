
import { Appointment } from "@/services/appointmentService";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface DayViewProps {
  selectedDate: Date;
  appointmentsForDay: Appointment[];
  openAppointmentDetails: (appointment: Appointment) => void;
  isLoading: boolean;
}

const DayView = ({
  selectedDate,
  appointmentsForDay,
  openAppointmentDetails,
  isLoading
}: DayViewProps) => {
  if (isLoading) {
    return <div className="flex justify-center items-center h-[calc(100vh-170px)]">Cargando...</div>;
  }

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
  
  return (
    <div className="flex flex-col h-[calc(100vh-170px)] overflow-y-auto">
      <div className="text-center py-4 border-b sticky top-0 bg-white">
        <p className="text-xl font-medium">
          {format(selectedDate, 'EEEE d MMMM', { locale: es })}
        </p>
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

export default DayView;
