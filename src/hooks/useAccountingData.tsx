
import { useState, useEffect } from "react";
import { getCompletedAppointments, Appointment, getPaymentMethodStats } from "@/services/appointmentService";
import { toast } from "sonner";

export type PaymentStats = {
  totalEfectivo: number;
  totalMercadoPago: number;
};

export const useAccountingData = () => {
  const [completedAppointments, setCompletedAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStats, setPaymentStats] = useState<PaymentStats>({
    totalEfectivo: 0,
    totalMercadoPago: 0
  });
  
  const loadCompletedAppointments = async () => {
    setIsLoading(true);
    try {
      const appointments = await getCompletedAppointments();
      setCompletedAppointments(appointments);
      
      // Load payment method statistics
      const stats = await getPaymentMethodStats();
      setPaymentStats(stats);
    } catch (error) {
      toast.error("Error al cargar los datos");
      console.error("Error loading accounting data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadCompletedAppointments();
  }, []);
  
  const calculateTotalRevenue = () => {
    return completedAppointments.reduce((total, appointment) => {
      return total + (appointment.price || 0);
    }, 0);
  };
  
  const calculateRevenueByMonth = () => {
    const revenueByMonth: Record<string, number> = {};
    
    completedAppointments.forEach(appointment => {
      const [day, month, year] = appointment.date.split('/');
      const monthKey = `${month}/${year}`;
      
      if (!revenueByMonth[monthKey]) {
        revenueByMonth[monthKey] = 0;
      }
      
      revenueByMonth[monthKey] += appointment.price || 0;
    });
    
    return revenueByMonth;
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
  };

  return {
    completedAppointments,
    isLoading,
    paymentStats,
    loadCompletedAppointments,
    calculateTotalRevenue,
    calculateRevenueByMonth,
    formatPrice,
    totalRevenue: calculateTotalRevenue(),
    revenueByMonth: calculateRevenueByMonth()
  };
};
