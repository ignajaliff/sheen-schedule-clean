
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Service {
  id: string;
  name: string;
  price: number;
  created_at: string;
  updated_at: string;
}

// Get all services with prices
export const getServices = async (): Promise<Service[]> => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('name');

    if (error) {
      toast.error("Error al obtener servicios: " + error.message);
      console.error("Error fetching services:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    toast.error("Error inesperado: " + (error as Error).message);
    console.error("Unexpected error fetching services:", error);
    return [];
  }
};

// Update service price
export const updateServicePrice = async (serviceId: string, newPrice: number): Promise<Service | null> => {
  try {
    if (newPrice <= 0) {
      toast.error("El precio debe ser mayor que cero");
      return null;
    }
    
    const { data, error } = await supabase
      .from('services')
      .update({ 
        price: newPrice,
        updated_at: new Date().toISOString()
      })
      .eq('id', serviceId)
      .select()
      .single();

    if (error) {
      toast.error("Error al actualizar precio: " + error.message);
      console.error("Error updating service price:", error);
      return null;
    }

    return data;
  } catch (error) {
    toast.error("Error inesperado: " + (error as Error).message);
    console.error("Unexpected error updating service price:", error);
    return null;
  }
};
