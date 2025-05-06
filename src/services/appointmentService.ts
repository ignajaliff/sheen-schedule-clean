
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Appointment {
  id: string;
  clientName: string;
  date: string;
  time: string;
  serviceType: string;
  location: string;
  isHomeService: boolean;
  status: "pending" | "completed" | "cancelled";
}

// Servicio para obtener los turnos
export const getAppointments = async (): Promise<Appointment[]> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*');

    if (error) {
      toast.error("Error al obtener turnos: " + error.message);
      return [];
    }

    return data.map(mapAppointmentFromSupabase);
  } catch (error) {
    toast.error("Error inesperado: " + (error as Error).message);
    return [];
  }
};

// Servicio para obtener un turno por ID
export const getAppointmentById = async (id: string): Promise<Appointment | undefined> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      if (error) {
        toast.error("Error al obtener turno: " + error.message);
      }
      return undefined;
    }

    return mapAppointmentFromSupabase(data);
  } catch (error) {
    toast.error("Error inesperado: " + (error as Error).message);
    return undefined;
  }
};

// Filtrar turnos por estado
export const getAppointmentsByStatus = async (status: string): Promise<Appointment[]> => {
  try {
    if (status === 'all') {
      return await getAppointments();
    }

    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('status', status);

    if (error) {
      toast.error("Error al filtrar turnos: " + error.message);
      return [];
    }

    return data.map(mapAppointmentFromSupabase);
  } catch (error) {
    toast.error("Error inesperado: " + (error as Error).message);
    return [];
  }
};

// Obtener estadísticas
export const getAppointmentStats = async () => {
  try {
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*');

    if (error) {
      toast.error("Error al obtener estadísticas: " + error.message);
      return {
        total: 0,
        completed: 0,
        cancelled: 0,
        pending: 0,
        completionRate: 0,
        homeServices: 0,
        workshopServices: 0,
        serviceTypes: {}
      };
    }

    const total = appointments.length;
    const completed = appointments.filter(app => app.status === "completed").length;
    const cancelled = appointments.filter(app => app.status === "cancelled").length;
    const pending = appointments.filter(app => app.status === "pending").length;
    
    const homeServices = appointments.filter(app => app.is_home_service).length;
    const workshopServices = appointments.filter(app => !app.is_home_service).length;
    
    // Conteo de tipos de servicio
    const serviceTypes: Record<string, number> = {};
    appointments.forEach(app => {
      if (serviceTypes[app.service_type]) {
        serviceTypes[app.service_type]++;
      } else {
        serviceTypes[app.service_type] = 1;
      }
    });
    
    return {
      total,
      completed,
      cancelled,
      pending,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      homeServices,
      workshopServices,
      serviceTypes
    };
  } catch (error) {
    toast.error("Error inesperado: " + (error as Error).message);
    return {
      total: 0,
      completed: 0,
      cancelled: 0,
      pending: 0,
      completionRate: 0,
      homeServices: 0,
      workshopServices: 0,
      serviceTypes: {}
    };
  }
};

// Verificar disponibilidad del horario
export const checkTimeAvailability = async (date: Date, time: string): Promise<number> => {
  try {
    const formattedDate = formatDateForDB(date);
    
    // Contar cuántos turnos hay para la misma fecha y hora
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('date', formattedDate)
      .eq('time', time)
      .neq('status', 'cancelled');
      
    if (error) {
      toast.error("Error al verificar disponibilidad: " + error.message);
      return 0;
    }
    
    return data.length;
  } catch (error) {
    toast.error("Error inesperado: " + (error as Error).message);
    return 0;
  }
};

// Agregar un nuevo turno
export interface NewAppointmentData {
  clientName: string;
  date: Date;
  time: string;
  serviceType: string;
  location: string;
  isHomeService: boolean;
}

export const addAppointment = async (appointmentData: NewAppointmentData): Promise<Appointment | { error: string }> => {
  try {
    const formattedDate = formatDateForDB(appointmentData.date);
    
    // Verificar si hay disponibilidad (máximo 2 turnos por horario)
    const currentAppointments = await checkTimeAvailability(appointmentData.date, appointmentData.time);
    
    if (currentAppointments >= 2) {
      return { error: "Horario no disponible. Ya hay 2 turnos agendados para este horario." };
    }
    
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        client_name: appointmentData.clientName,
        date: formattedDate,
        time: appointmentData.time,
        service_type: appointmentData.serviceType,
        location: appointmentData.isHomeService ? appointmentData.location : "Taller principal",
        is_home_service: appointmentData.isHomeService,
        status: "pending"
      })
      .select()
      .single();
      
    if (error) {
      toast.error("Error al crear turno: " + error.message);
      return { error: "Error al crear turno: " + error.message };
    }
    
    return mapAppointmentFromSupabase(data);
  } catch (error) {
    toast.error("Error inesperado: " + (error as Error).message);
    return { error: "Error inesperado: " + (error as Error).message };
  }
};

// Actualizar el estado de un turno
export const updateAppointmentStatus = async (id: string, status: "pending" | "completed" | "cancelled"): Promise<Appointment | undefined> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      toast.error("Error al actualizar estado: " + error.message);
      return undefined;
    }
    
    return mapAppointmentFromSupabase(data);
  } catch (error) {
    toast.error("Error inesperado: " + (error as Error).message);
    return undefined;
  }
};

// Funciones auxiliares para formatear fechas
const formatDateForDB = (date: Date): string => {
  return date.toISOString().split('T')[0]; // Formato YYYY-MM-DD para PostgreSQL
};

// Formatear fecha de la base de datos (YYYY-MM-DD) a formato de la aplicación (DD/MM/YYYY)
const formatDateFromDB = (dateString: string): string => {
  // Parseamos la fecha usando el formato correcto sin ajustar zona horaria
  const [year, month, day] = dateString.split('-').map(Number);
  
  // La función Date() interpreta fechas en formato ISO como UTC si no se incluye la hora
  // Como solo queremos la fecha y no la hora, creamos los componentes individualmente
  const formattedDay = day.toString().padStart(2, '0');
  const formattedMonth = month.toString().padStart(2, '0');
  
  return `${formattedDay}/${formattedMonth}/${year}`;
};

// Función de mapeo para convertir de formato Supabase a formato de la aplicación
const mapAppointmentFromSupabase = (appointment: any): Appointment => {
  return {
    id: appointment.id,
    clientName: appointment.client_name,
    date: formatDateFromDB(appointment.date),
    time: appointment.time,
    serviceType: appointment.service_type,
    location: appointment.location,
    isHomeService: appointment.is_home_service,
    status: appointment.status as "pending" | "completed" | "cancelled"
  };
};
