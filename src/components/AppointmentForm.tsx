
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { addAppointment, checkTimeAvailability, NewAppointmentData } from "@/services/appointmentService";
import { CalendarIcon } from "lucide-react";

interface AppointmentFormProps {
  open: boolean;
  onClose: () => void;
  onAppointmentAdded: () => void;
}

const AppointmentForm = ({ open, onClose, onAppointmentAdded }: AppointmentFormProps) => {
  const [formData, setFormData] = useState<NewAppointmentData>({
    clientName: "",
    date: new Date(),
    time: "10:00",
    serviceType: "Lavado completo",
    location: "",
    isHomeService: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: keyof NewAppointmentData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, date }));
    }
  };
  
  const handleHomeServiceChange = (checked: boolean) => {
    setFormData(prev => ({ 
      ...prev, 
      isHomeService: checked,
      location: checked ? prev.location : ""
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validar que todos los campos estén completos
      if (!formData.clientName) {
        toast.error("Debe ingresar el nombre del cliente");
        setIsLoading(false);
        return;
      }
      
      if (formData.isHomeService && !formData.location) {
        toast.error("Debe ingresar la dirección para servicio a domicilio");
        setIsLoading(false);
        return;
      }
      
      // Verificar disponibilidad del horario
      const currentAppointments = await checkTimeAvailability(formData.date, formData.time);
      
      if (currentAppointments >= 2) {
        toast.error("Horario no disponible. Ya hay 2 turnos agendados para este horario.");
        setIsLoading(false);
        return;
      }
      
      // Enviar los datos del formulario
      const result = await addAppointment(formData);
      
      if ('error' in result) {
        toast.error(result.error);
      } else {
        toast.success("Turno agendado correctamente");
        onAppointmentAdded();
        onClose();
        // Resetear el formulario
        setFormData({
          clientName: "",
          date: new Date(),
          time: "10:00",
          serviceType: "Lavado completo",
          location: "",
          isHomeService: false
        });
      }
    } catch (error) {
      toast.error("Error al agendar el turno: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Agendar Nuevo Turno</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="clientName">Nombre del Cliente</Label>
            <Input 
              id="clientName"
              name="clientName"
              value={formData.clientName}
              onChange={handleInputChange}
              placeholder="Nombre completo"
              className="mt-1"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Fecha</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal mt-1"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.date, "PPP", { locale: es })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={handleDateSelect}
                    locale={es}
                    fromDate={new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label htmlFor="time">Hora</Label>
              <Select
                value={formData.time}
                onValueChange={(value) => handleSelectChange("time", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccionar hora" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => i + 9).map((hour) => (
                    <SelectItem key={hour} value={`${hour}:00`}>{`${hour}:00`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="serviceType">Tipo de Servicio</Label>
            <Select
              value={formData.serviceType}
              onValueChange={(value) => handleSelectChange("serviceType", value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Seleccionar servicio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lavado completo">Lavado completo</SelectItem>
                <SelectItem value="Lavado exterior">Lavado exterior</SelectItem>
                <SelectItem value="Limpieza de interiores">Limpieza de interiores</SelectItem>
                <SelectItem value="Lavado y encerado">Lavado y encerado</SelectItem>
                <SelectItem value="Lavado premium">Lavado premium</SelectItem>
                <SelectItem value="Limpieza de tapicería">Limpieza de tapicería</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="isHomeService"
              checked={formData.isHomeService}
              onCheckedChange={handleHomeServiceChange}
            />
            <Label htmlFor="isHomeService">Servicio a domicilio</Label>
          </div>
          
          {formData.isHomeService && (
            <div>
              <Label htmlFor="location">Dirección</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Dirección completa"
                className="mt-1"
              />
            </div>
          )}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Agendando..." : "Agendar Turno"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentForm;
