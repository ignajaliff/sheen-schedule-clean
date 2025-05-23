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
  price: number | null;
  paymentMethod: string | null;
}

// Servicio para obtener los turnos
export const getAppointments = async (): Promise<Appointment[]> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*');

    if (error) {
      toast.error("Error al obtener turnos: " + error.message);
      console.error("Error fetching appointments:", error);
      return [];
    }

    if (!data || !Array.isArray(data)) {
      console.error("No data or invalid data format returned from Supabase", data);
      return [];
    }

    return data.map(mapAppointmentFromSupabase);
  } catch (error) {
    toast.error("Error inesperado: " + (error as Error).message);
    console.error("Unexpected error fetching appointments:", error);
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
        console.error("Error fetching appointment by ID:", error);
      }
      return undefined;
    }

    return mapAppointmentFromSupabase(data);
  } catch (error) {
    toast.error("Error inesperado: " + (error as Error).message);
    console.error("Unexpected error fetching appointment by ID:", error);
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
      console.error("Error filtering appointments by status:", error);
      return [];
    }

    if (!data || !Array.isArray(data)) {
      console.error("No data or invalid data format returned from Supabase when filtering by status", data);
      return [];
    }

    return data.map(mapAppointmentFromSupabase);
  } catch (error) {
    toast.error("Error inesperado: " + (error as Error).message);
    console.error("Unexpected error filtering appointments by status:", error);
    return [];
  }
};

// Get payment method statistics
export const getPaymentMethodStats = async () => {
  try {
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('status', 'completed');

    if (error) {
      toast.error("Error al obtener estadísticas de pago: " + error.message);
      console.error("Error fetching payment method statistics:", error);
      return {
        totalEfectivo: 0,
        totalMercadoPago: 0
      };
    }

    if (!appointments || !Array.isArray(appointments)) {
      console.error("No data or invalid data format returned when fetching payment statistics", appointments);
      return {
        totalEfectivo: 0,
        totalMercadoPago: 0
      };
    }

    const totalEfectivo = appointments
      .filter(app => app.payment_method === "Efectivo")
      .reduce((sum, app) => sum + (app.price || 0), 0);
    
    const totalMercadoPago = appointments
      .filter(app => app.payment_method === "Mercado Pago")
      .reduce((sum, app) => sum + (app.price || 0), 0);
    
    return {
      totalEfectivo,
      totalMercadoPago
    };
  } catch (error) {
    toast.error("Error inesperado: " + (error as Error).message);
    console.error("Unexpected error fetching payment method statistics:", error);
    return {
      totalEfectivo: 0,
      totalMercadoPago: 0
    };
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
      console.error("Error fetching appointment statistics:", error);
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

    if (!appointments || !Array.isArray(appointments)) {
      console.error("No data or invalid data format returned when fetching statistics", appointments);
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
    console.error("Unexpected error fetching appointment statistics:", error);
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
      console.error("Error checking time availability:", error);
      return 0;
    }
    
    if (!data || !Array.isArray(data)) {
      console.error("No data or invalid data format returned when checking availability", data);
      return 0;
    }
    
    return data.length;
  } catch (error) {
    toast.error("Error inesperado: " + (error as Error).message);
    console.error("Unexpected error checking time availability:", error);
    return 0;
  }
};

// Get price for a service
export const getServicePrice = async (serviceName: string): Promise<number | null> => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('price')
      .eq('name', serviceName)
      .maybeSingle();
      
    if (error || !data) {
      console.error("Error fetching service price:", error);
      return null;
    }
    
    return data.price;
  } catch (error) {
    console.error("Unexpected error fetching service price:", error);
    return null;
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
    
    // Get price for the selected service
    const price = await getServicePrice(appointmentData.serviceType);
    
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        client_name: appointmentData.clientName,
        date: formattedDate,
        time: appointmentData.time,
        service_type: appointmentData.serviceType,
        location: appointmentData.isHomeService ? appointmentData.location : "Taller principal",
        is_home_service: appointmentData.isHomeService,
        status: "pending",
        price: price
      })
      .select()
      .single();
      
    if (error) {
      toast.error("Error al crear turno: " + error.message);
      console.error("Error creating appointment:", error);
      return { error: "Error al crear turno: " + error.message };
    }
    
    if (!data) {
      console.error("No data returned when creating appointment");
      return { error: "No se pudo crear el turno: No se recibieron datos del servidor" };
    }
    
    return mapAppointmentFromSupabase(data);
  } catch (error) {
    toast.error("Error inesperado: " + (error as Error).message);
    console.error("Unexpected error creating appointment:", error);
    return { error: "Error inesperado: " + (error as Error).message };
  }
};

// Update the appointment status and payment method
export const updateAppointmentStatus = async (
  id: string, 
  status: "pending" | "completed" | "cancelled",
  paymentMethod?: string
): Promise<Appointment | undefined> => {
  try {
    const updateData: { status: string, payment_method?: string } = { status };
    
    // Only add payment method if appointment is being marked as completed
    if (status === "completed" && paymentMethod) {
      updateData.payment_method = paymentMethod;
    }

    const { data, error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      toast.error("Error al actualizar estado: " + error.message);
      console.error("Error updating appointment status:", error);
      return undefined;
    }
    
    if (!data) {
      console.error("No data returned when updating appointment status");
      return undefined;
    }
    
    return mapAppointmentFromSupabase(data);
  } catch (error) {
    toast.error("Error inesperado: " + (error as Error).message);
    console.error("Unexpected error updating appointment status:", error);
    return undefined;
  }
};

// Get completed appointments for accounting
export const getCompletedAppointments = async (): Promise<Appointment[]> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('status', 'completed')
      .order('date', { ascending: false });

    if (error) {
      toast.error("Error al obtener turnos completados: " + error.message);
      console.error("Error fetching completed appointments:", error);
      return [];
    }

    return data ? data.map(mapAppointmentFromSupabase) : [];
  } catch (error) {
    toast.error("Error inesperado: " + (error as Error).message);
    console.error("Unexpected error fetching completed appointments:", error);
    return [];
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
  if (!appointment) {
    console.error("Tried to map undefined or null appointment", appointment);
    throw new Error("No se puede mapear un turno nulo o indefinido");
  }

  try {
    return {
      id: appointment.id,
      clientName: appointment.client_name,
      date: formatDateFromDB(appointment.date),
      time: appointment.time,
      serviceType: appointment.service_type,
      location: appointment.location,
      isHomeService: appointment.is_home_service,
      status: appointment.status as "pending" | "completed" | "cancelled",
      price: appointment.price,
      paymentMethod: appointment.payment_method
    };
  } catch (error) {
    console.error("Error mapping appointment from Supabase", error, appointment);
    throw error;
  }
};
