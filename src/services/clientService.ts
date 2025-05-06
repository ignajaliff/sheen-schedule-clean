
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  preferredContactMethod: "email" | "phone" | "whatsapp";
  vehicles: Vehicle[];
  notes: string;
  loyaltyPoints: number;
  lastServiceDate: string | null;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: string;
  licensePlate: string;
  type: "small" | "medium" | "large" | "suv" | "truck";
  color: string;
}

// Obtener todos los clientes
export const getClients = async (): Promise<Client[]> => {
  try {
    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .select(`
        id,
        name,
        email,
        phone,
        preferred_contact_method,
        notes,
        loyalty_points,
        last_service_date,
        created_at
      `);

    if (clientsError) {
      toast.error("Error al obtener clientes: " + clientsError.message);
      return [];
    }

    // Obtener vehículos para cada cliente
    const clientsWithVehicles = await Promise.all(
      clientsData.map(async (client) => {
        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('client_id', client.id);

        if (vehiclesError) {
          toast.error("Error al obtener vehículos: " + vehiclesError.message);
          return {
            ...mapClientFromSupabase(client),
            vehicles: [],
          };
        }

        return {
          ...mapClientFromSupabase(client),
          vehicles: vehiclesData.map(mapVehicleFromSupabase),
        };
      })
    );

    return clientsWithVehicles;
  } catch (error) {
    toast.error("Error inesperado: " + (error as Error).message);
    return [];
  }
};

// Obtener un cliente por ID
export const getClientById = async (id: string): Promise<Client | undefined> => {
  try {
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select(`
        id,
        name,
        email,
        phone,
        preferred_contact_method,
        notes,
        loyalty_points,
        last_service_date,
        created_at
      `)
      .eq('id', id)
      .maybeSingle();

    if (clientError || !client) {
      if (clientError) {
        toast.error("Error al obtener cliente: " + clientError.message);
      }
      return undefined;
    }

    // Obtener vehículos del cliente
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('client_id', id);

    if (vehiclesError) {
      toast.error("Error al obtener vehículos: " + vehiclesError.message);
      return {
        ...mapClientFromSupabase(client),
        vehicles: [],
      };
    }

    return {
      ...mapClientFromSupabase(client),
      vehicles: vehicles.map(mapVehicleFromSupabase),
    };
  } catch (error) {
    toast.error("Error inesperado: " + (error as Error).message);
    return undefined;
  }
};

// Buscar clientes por nombre
export const searchClientsByName = async (query: string): Promise<Client[]> => {
  try {
    if (!query) {
      return await getClients();
    }

    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .select(`
        id,
        name,
        email,
        phone,
        preferred_contact_method,
        notes,
        loyalty_points,
        last_service_date,
        created_at
      `)
      .ilike('name', `%${query}%`);

    if (clientsError) {
      toast.error("Error al buscar clientes: " + clientsError.message);
      return [];
    }

    // Obtener vehículos para cada cliente
    const clientsWithVehicles = await Promise.all(
      clientsData.map(async (client) => {
        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('client_id', client.id);

        if (vehiclesError) {
          toast.error("Error al obtener vehículos: " + vehiclesError.message);
          return {
            ...mapClientFromSupabase(client),
            vehicles: [],
          };
        }

        return {
          ...mapClientFromSupabase(client),
          vehicles: vehiclesData.map(mapVehicleFromSupabase),
        };
      })
    );

    return clientsWithVehicles;
  } catch (error) {
    toast.error("Error inesperado: " + (error as Error).message);
    return [];
  }
};

// Agregar un nuevo cliente
export const addClient = async (client: Omit<Client, "id" | "vehicles">): Promise<Client | undefined> => {
  try {
    const { data: newClient, error } = await supabase
      .from('clients')
      .insert({
        name: client.name,
        email: client.email,
        phone: client.phone,
        preferred_contact_method: client.preferredContactMethod,
        notes: client.notes,
        loyalty_points: client.loyaltyPoints,
        last_service_date: client.lastServiceDate ? new Date(client.lastServiceDate) : null,
      })
      .select()
      .single();

    if (error) {
      toast.error("Error al agregar cliente: " + error.message);
      return undefined;
    }

    return {
      ...mapClientFromSupabase(newClient),
      vehicles: [],
    };
  } catch (error) {
    toast.error("Error inesperado: " + (error as Error).message);
    return undefined;
  }
};

// Actualizar puntos de fidelización
export const updateLoyaltyPoints = async (clientId: string, points: number): Promise<Client | undefined> => {
  try {
    // Primero obtenemos los puntos actuales
    const { data: currentClient, error: fetchError } = await supabase
      .from('clients')
      .select('loyalty_points')
      .eq('id', clientId)
      .maybeSingle();

    if (fetchError || !currentClient) {
      if (fetchError) {
        toast.error("Error al obtener cliente: " + fetchError.message);
      }
      return undefined;
    }

    const newPoints = currentClient.loyalty_points + points;

    // Ahora actualizamos los puntos
    const { data: updatedClient, error: updateError } = await supabase
      .from('clients')
      .update({ loyalty_points: newPoints })
      .eq('id', clientId)
      .select()
      .single();

    if (updateError) {
      toast.error("Error al actualizar puntos: " + updateError.message);
      return undefined;
    }

    // Obtenemos los vehículos del cliente
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('client_id', clientId);

    if (vehiclesError) {
      toast.error("Error al obtener vehículos: " + vehiclesError.message);
      return {
        ...mapClientFromSupabase(updatedClient),
        vehicles: [],
      };
    }

    return {
      ...mapClientFromSupabase(updatedClient),
      vehicles: vehicles.map(mapVehicleFromSupabase),
    };
  } catch (error) {
    toast.error("Error inesperado: " + (error as Error).message);
    return undefined;
  }
};

// Agregar un nuevo vehículo a un cliente
export const addVehicleToClient = async (clientId: string, vehicle: Omit<Vehicle, "id">): Promise<Client | undefined> => {
  try {
    const { data: newVehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .insert({
        client_id: clientId,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        license_plate: vehicle.licensePlate,
        type: vehicle.type,
        color: vehicle.color,
      })
      .select()
      .single();

    if (vehicleError) {
      toast.error("Error al agregar vehículo: " + vehicleError.message);
      return undefined;
    }

    // Obtener el cliente actualizado con todos sus vehículos
    return await getClientById(clientId);
  } catch (error) {
    toast.error("Error inesperado: " + (error as Error).message);
    return undefined;
  }
};

// Actualizar la fecha del último servicio
export const updateLastServiceDate = async (clientId: string, date: string): Promise<Client | undefined> => {
  try {
    const formattedDate = new Date(date);

    const { data: updatedClient, error } = await supabase
      .from('clients')
      .update({ last_service_date: formattedDate })
      .eq('id', clientId)
      .select()
      .single();

    if (error) {
      toast.error("Error al actualizar fecha de servicio: " + error.message);
      return undefined;
    }

    // Obtener los vehículos del cliente
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('client_id', clientId);

    if (vehiclesError) {
      toast.error("Error al obtener vehículos: " + vehiclesError.message);
      return {
        ...mapClientFromSupabase(updatedClient),
        vehicles: [],
      };
    }

    return {
      ...mapClientFromSupabase(updatedClient),
      vehicles: vehicles.map(mapVehicleFromSupabase),
    };
  } catch (error) {
    toast.error("Error inesperado: " + (error as Error).message);
    return undefined;
  }
};

// Funciones de mapeo para convertir de formato Supabase a formato de la aplicación
const mapClientFromSupabase = (client: any): Omit<Client, "vehicles"> => {
  return {
    id: client.id,
    name: client.name,
    email: client.email,
    phone: client.phone,
    preferredContactMethod: client.preferred_contact_method,
    notes: client.notes || "",
    loyaltyPoints: client.loyalty_points,
    lastServiceDate: client.last_service_date ? formatDateFromDB(client.last_service_date) : null,
  };
};

const mapVehicleFromSupabase = (vehicle: any): Vehicle => {
  return {
    id: vehicle.id,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    licensePlate: vehicle.license_plate,
    type: vehicle.type,
    color: vehicle.color,
  };
};

// Formatear fecha de la base de datos (YYYY-MM-DD) a formato de la aplicación (DD/MM/YYYY)
const formatDateFromDB = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};
