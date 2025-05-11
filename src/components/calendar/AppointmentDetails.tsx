
import { Appointment, updateAppointmentStatus } from "@/services/appointmentService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface AppointmentDetailsProps {
  appointment: Appointment | null;
  onClose: () => void;
  onStatusUpdated: () => void;
}

const AppointmentDetails = ({ 
  appointment, 
  onClose, 
  onStatusUpdated 
}: AppointmentDetailsProps) => {
  const [paymentMethod, setPaymentMethod] = useState<string>("Efectivo");
  
  if (!appointment) return null;

  const handleStatusUpdate = async (id: string, status: "completed" | "cancelled") => {
    try {
      // Only pass payment method if completing the appointment
      const updatedAppointment = await updateAppointmentStatus(
        id, 
        status,
        status === "completed" ? paymentMethod : undefined
      );
      
      if (updatedAppointment) {
        onStatusUpdated();
        onClose();
        
        if (status === "completed") {
          toast.success(`Turno completado correctamente (Pago: ${paymentMethod})`);
        } else {
          toast.info("Turno cancelado");
        }
      }
    } catch (error) {
      toast.error("Error al actualizar el estado del turno");
      console.error("Error updating appointment status:", error);
    }
  };

  return (
    <Dialog open={!!appointment} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Detalles del Turno</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Cliente</h3>
            <p className="text-lg">{appointment.clientName}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Fecha</h3>
              <p>{appointment.date}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Hora</h3>
              <p>{appointment.time}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Servicio</h3>
              <p>{appointment.serviceType}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Precio</h3>
              <p className="font-semibold">${new Intl.NumberFormat('es-CL').format(appointment.price || 0)}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Lugar</h3>
            <p>{appointment.isHomeService ? "Domicilio" : "Taller"}</p>
          </div>
          
          {appointment.isHomeService && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Dirección</h3>
              <p>{appointment.location}</p>
            </div>
          )}
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Estado</h3>
            <p className="capitalize">
              {appointment.status === "pending" && "Pendiente"}
              {appointment.status === "completed" && "Completado"}
              {appointment.status === "cancelled" && "Cancelado"}
            </p>
          </div>
          
          {appointment.status === "completed" && appointment.paymentMethod && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Método de Pago</h3>
              <p>{appointment.paymentMethod}</p>
            </div>
          )}
        </div>
        
        {appointment.status === "pending" && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Método de Pago</h3>
            <RadioGroup
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              className="flex flex-col gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Efectivo" id="efectivo" />
                <Label htmlFor="efectivo">Efectivo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Mercado Pago" id="mercado-pago" />
                <Label htmlFor="mercado-pago">Mercado Pago</Label>
              </div>
            </RadioGroup>
          </div>
        )}
        
        <DialogFooter className="gap-2 sm:gap-0">
          {appointment.status === "pending" && (
            <>
              <Button 
                variant="outline" 
                className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                onClick={() => handleStatusUpdate(appointment.id, "cancelled")}
              >
                Cancelar Turno
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleStatusUpdate(appointment.id, "completed")}
              >
                Marcar Completado
              </Button>
            </>
          )}
          {(appointment.status === "completed" || appointment.status === "cancelled") && (
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDetails;
