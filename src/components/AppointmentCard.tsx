
import { Calendar, Clock, MapPin, User, Droplets } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Appointment } from "@/services/appointmentService";

interface AppointmentCardProps {
  appointment: Appointment; 
  onStatusUpdated: () => void;
}

const AppointmentCard = ({
  appointment,
  onStatusUpdated
}: AppointmentCardProps) => {
  
  const getStatusColor = () => {
    switch(appointment.status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  
  const getStatusText = () => {
    switch(appointment.status) {
      case "pending":
        return "Pendiente";
      case "completed":
        return "Completado";
      case "cancelled":
        return "Cancelado";
      default:
        return "Desconocido";
    }
  };

  return (
    <div 
      className="cleanly-card mb-4 p-4 cursor-pointer transform transition hover:-translate-y-1 animate-fade-in"
      onClick={() => onStatusUpdated()}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium text-lg flex items-center">
          <User size={16} className="text-cleanly-blue mr-2" />
          {appointment.clientName}
        </h3>
        <Badge className={`${getStatusColor()} px-2 py-1 capitalize`}>
          {getStatusText()}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar size={14} className="mr-2 text-cleanly-blue" />
          {appointment.date}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock size={14} className="mr-2 text-cleanly-blue" />
          {appointment.time}
        </div>
      </div>
      
      <div className="mb-2 flex items-center text-sm text-gray-600">
        <Droplets size={14} className="mr-2 text-cleanly-blue" />
        {appointment.serviceType}
      </div>
      
      {appointment.isHomeService && (
        <div className="flex items-center text-sm text-gray-600">
          <MapPin size={14} className="mr-2 text-cleanly-red" />
          <span className="font-medium">{appointment.location}</span>
        </div>
      )}
    </div>
  );
};

export default AppointmentCard;
