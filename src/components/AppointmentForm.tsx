
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CarIcon, Calendar as CalendarIcon, Clock, Droplets } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { addAppointment, NewAppointmentData } from "@/services/appointmentService";

interface AppointmentFormProps {
  open: boolean;
  onClose: () => void;
  onAppointmentAdded?: () => void;
}

const services = [
  "Lavado básico",
  "Lavado completo",
  "Lavado exterior",
  "Lavado y encerado",
  "Limpieza de interiores",
  "Lavado premium",
  "Limpieza de tapicería"
];

const times = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", 
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
];

const AppointmentForm = ({ open, onClose, onAppointmentAdded }: AppointmentFormProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [serviceLocation, setServiceLocation] = useState("workshop");
  const [formData, setFormData] = useState({
    clientName: "",
    serviceType: "",
    time: "",
    location: ""
  });
  
  const [errors, setErrors] = useState({
    clientName: false,
    serviceType: false,
    time: false,
    location: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (value) {
      setErrors({
        ...errors,
        [name]: false
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
    setErrors({
      ...errors,
      [name]: false
    });
  };

  const validateForm = () => {
    const newErrors = {
      clientName: !formData.clientName,
      serviceType: !formData.serviceType,
      time: !formData.time,
      location: serviceLocation === "home" && !formData.location
    };
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const resetForm = () => {
    setFormData({
      clientName: "",
      serviceType: "",
      time: "",
      location: ""
    });
    setServiceLocation("workshop");
    setDate(new Date());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm() && date) {
      const appointmentData: NewAppointmentData = {
        clientName: formData.clientName,
        date: date,
        time: formData.time,
        serviceType: formData.serviceType,
        location: formData.location,
        isHomeService: serviceLocation === "home"
      };
      
      // Agregar el nuevo turno
      const newAppointment = addAppointment(appointmentData);
      
      toast.success("Turno agendado correctamente", {
        description: `${formData.clientName} - ${format(date, "dd/MM/yyyy")} ${formData.time}`
      });
      
      // Notificar que se ha agregado un turno (para actualizar vistas)
      if (onAppointmentAdded) {
        onAppointmentAdded();
      }
      
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-6 animate-fade-in">
        <DialogHeader>
          <DialogTitle className="text-xl text-center flex items-center justify-center">
            <CarIcon className="mr-2 text-cleanly-blue" />
            Nuevo Turno
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Nombre del Cliente</Label>
            <Input
              id="clientName"
              name="clientName"
              value={formData.clientName}
              onChange={handleInputChange}
              className={errors.clientName ? "border-red-500" : ""}
            />
            {errors.clientName && (
              <p className="text-red-500 text-xs">El nombre del cliente es requerido</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Fecha</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Seleccionar fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 pointer-events-auto">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className="p-3"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label>Hora</Label>
            <Select 
              onValueChange={(value) => handleSelectChange("time", value)}
              value={formData.time}
            >
              <SelectTrigger className={errors.time ? "border-red-500" : ""}>
                <SelectValue placeholder="Seleccionar horario">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    {formData.time || "Seleccionar horario"}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {times.map((time) => (
                  <SelectItem key={time} value={time}>{time}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.time && (
              <p className="text-red-500 text-xs">Seleccione un horario</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Tipo de Servicio</Label>
            <Select
              onValueChange={(value) => handleSelectChange("serviceType", value)}
              value={formData.serviceType}
            >
              <SelectTrigger className={errors.serviceType ? "border-red-500" : ""}>
                <SelectValue placeholder="Seleccionar servicio">
                  <div className="flex items-center">
                    <Droplets className="mr-2 h-4 w-4" />
                    {formData.serviceType || "Seleccionar servicio"}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service} value={service}>{service}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.serviceType && (
              <p className="text-red-500 text-xs">Seleccione un tipo de servicio</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Lugar del Servicio</Label>
            <RadioGroup 
              value={serviceLocation} 
              onValueChange={setServiceLocation}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="workshop" id="workshop" />
                <Label htmlFor="workshop" className="cursor-pointer">Taller</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="home" id="home" />
                <Label htmlFor="home" className="cursor-pointer">Domicilio</Label>
              </div>
            </RadioGroup>
          </div>
          
          {serviceLocation === "home" && (
            <div className="space-y-2 animate-fade-in">
              <Label htmlFor="location">Dirección</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className={errors.location ? "border-red-500" : ""}
              />
              {errors.location && (
                <p className="text-red-500 text-xs">La dirección es requerida para servicios a domicilio</p>
              )}
            </div>
          )}
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button type="submit" className="w-full sm:w-auto bg-cleanly-blue hover:bg-blue-700">
              Agendar Turno
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentForm;
