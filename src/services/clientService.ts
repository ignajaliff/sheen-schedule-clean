
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  preferredContactMethod: string;
  loyaltyPoints: number;
  lastServiceDate: string | null;
  notes: string | null;
}

export interface Vehicle {
  id: string;
  clientId: string;
  make: string;
  model: string;
  year: string;
  licensePlate: string;
  type: string;
  color: string;
}

// Obtener todos los clientes
export const getClients = async (): Promise<Client[]> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name');
      
    if (error) {
      toast.error("Error al obtener clientes: " + error.message);
      return [];
    }
    
    return data.map(mapClientFromSupabase);
  } catch (error) {
    toast.error("Error inesperado: " + (error as Error).message);
    return [];
  }
};

// Buscar clientes por nombre
export const searchClients = async (query: string): Promise<Client[]> => {
  try {
    if (!query.trim()) {
      return await getClients();
    }
    
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('name');
      
    if (error) {
      toast.error("Error al buscar clientes: " + error.message);
      return [];
    }
    
    return data.map(mapClientFromSupabase);
  } catch (error) {
    toast.error("Error inesperado: " + (error as Error).message);
    return [];
  }
};

// Obtener un cliente por ID
export const getClientById = async (id: string): Promise<Client | null> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .maybeSingle();
      
    if (error || !data) {
      if (error) {
        toast.error("Error al obtener cliente: " + error.message);
      }
      return null;
    }
    
    return mapClientFromSupabase(data);
  } catch (error) {
    toast.error("Error inesperado: " + (error as Error).message);
    return null;
  }
};

// Obtener vehículos de un cliente
export const getVehiclesByClientId = async (clientId: string): Promise<Vehicle[]> => {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('client_id', clientId);
      
    if (error) {
      toast.error("Error al obtener vehículos: " + error.message);
      return [];
    }
    
    return data.map(mapVehicleFromSupabase);
  } catch (error) {
    toast.error("Error inesperado: " + (error as Error).message);
    return [];
  }
};

// Añadir un nuevo cliente
export interface NewClientData {
  name: string;
  email: string;
  phone: string;
  preferredContactMethod: string;
  notes?: string;
}

export const addClient = async (clientData: NewClientData): Promise<Client | null> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .insert({
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone,
        preferred_contact_method: clientData.preferredContactMethod,
        notes: clientData.notes || null,
        loyalty_points: 0,
      })
      .select()
      .single();
      
    if (error) {
      toast.error("Error al crear cliente: " + error.message);
      return null;
    }
    
    return mapClientFromSupabase(data);
  } catch (error) {
    toast.error("Error inesperado: " + (error as Error).message);
    return null;
  }
};

// Añadir un nuevo vehículo
export interface NewVehicleData {
  clientId: string;
  make: string;
  model: string;
  year: string;
  licensePlate: string;
  type: string;
  color: string;
}

export const addVehicle = async (vehicleData: NewVehicleData): Promise<Vehicle | null> => {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .insert({
        client_id: vehicleData.clientId,
        make: vehicleData.make,
        model: vehicleData.model,
        year: vehicleData.year,
        license_plate: vehicleData.licensePlate,
        type: vehicleData.type,
        color: vehicleData.color,
      })
      .select()
      .single();
      
    if (error) {
      toast.error("Error al añadir vehículo: " + error.message);
      return null;
    }
    
    return mapVehicleFromSupabase(data);
  } catch (error) {
    toast.error("Error inesperado: " + (error as Error).message);
    return null;
  }
};

// Actualizar un cliente
export const updateClient = async (id: string, clientData: Partial<Client>): Promise<Client | null> => {
  try {
    // Convertir a formato de la base de datos
    const dbData: any = {
      name: clientData.name,
      email: clientData.email,
      phone: clientData.phone,
      preferred_contact_method: clientData.preferredContactMethod,
      notes: clientData.notes,
    };
    
    // Eliminar propiedades undefined
    Object.keys(dbData).forEach(key => {
      if (dbData[key] === undefined) {
        delete dbData[key];
      }
    });
    
    const { data, error } = await supabase
      .from('clients')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      toast.error("Error al actualizar cliente: " + error.message);
      return null;
    }
    
    return mapClientFromSupabase(data);
  } catch (error) {
    toast.error("Error inesperado: " + (error as Error).message);
    return null;
  }
};

// Actualizar la fecha del último servicio de un cliente
export const updateLastServiceDate = async (clientId: string): Promise<boolean> => {
  try {
    const today = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
    
    const { error } = await supabase
      .from('clients')
      .update({ last_service_date: today })
      .eq('id', clientId);
      
    if (error) {
      toast.error("Error al actualizar fecha de servicio: " + error.message);
      return false;
    }
    
    return true;
  } catch (error) {
    toast.error("Error inesperado: " + (error as Error).message);
    return false;
  }
};

// Actualizar los puntos de fidelidad de un cliente
export const updateLoyaltyPoints = async (clientId: string, points: number): Promise<boolean> => {
  try {
    // Primero obtenemos los puntos actuales
    const { data: client, error: fetchError } = await supabase
      .from('clients')
      .select('loyalty_points')
      .eq('id', clientId)
      .maybeSingle();
      
    if (fetchError || !client) {
      toast.error("Error al obtener puntos del cliente: " + (fetchError?.message || "No se encontró el cliente"));
      return false;
    }
    
    const newPoints = client.loyalty_points + points;
    
    const { error } = await supabase
      .from('clients')
      .update({ loyalty_points: newPoints })
      .eq('id', clientId);
      
    if (error) {
      toast.error("Error al actualizar puntos: " + error.message);
      return false;
    }
    
    return true;
  } catch (error) {
    toast.error("Error inesperado: " + (error as Error).message);
    return false;
  }
};

// Utilidades para mapear los datos entre Supabase y la aplicación
const mapClientFromSupabase = (client: any): Client => {
  return {
    id: client.id,
    name: client.name,
    email: client.email,
    phone: client.phone,
    preferredContactMethod: client.preferred_contact_method,
    loyaltyPoints: client.loyalty_points,
    lastServiceDate: client.last_service_date,
    notes: client.notes,
  };
};

const mapVehicleFromSupabase = (vehicle: any): Vehicle => {
  return {
    id: vehicle.id,
    clientId: vehicle.client_id,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    licensePlate: vehicle.license_plate,
    type: vehicle.type,
    color: vehicle.color,
  };
};
