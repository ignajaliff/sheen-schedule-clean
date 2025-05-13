
import { Coins, CheckCheck, DollarSign } from "lucide-react";
import Header from "@/components/Header";
import StatsCard from "@/components/accounting/StatsCard";
import RevenueByMonth from "@/components/accounting/RevenueByMonth";
import CompletedAppointmentsTable from "@/components/accounting/CompletedAppointmentsTable";
import MercadoPagoIcon from "@/components/accounting/MercadoPagoIcon";
import { useAccountingData } from "@/hooks/useAccountingData";

const AccountingPage = () => {
  const {
    completedAppointments,
    isLoading,
    paymentStats,
    formatPrice,
    totalRevenue,
    revenueByMonth
  } = useAccountingData();
  
  return (
    <div className="pb-20 md:pb-5 md:pl-20">
      <Header title="Contabilidad" />
      
      <main className="pt-20 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Ingresos Totales */}
          <StatsCard
            title="Ingresos Totales"
            description="Total de todos los servicios completados"
            value={formatPrice(totalRevenue)}
            icon={<Coins className="h-5 w-5" />}
            gradient="from-blue-100 to-blue-300"
          />
          
          {/* Servicios Completados */}
          <StatsCard
            title="Servicios Completados"
            description="Cantidad de servicios realizados"
            value={completedAppointments.length.toString()}
            icon={<CheckCheck className="h-5 w-5" />}
            gradient="from-green-100 to-green-300"
          />
        </div>
        
        {/* Payment Method Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Mercado Pago */}
          <StatsCard
            title="Ingresos en Mercado Pago"
            description="Total pagado con Mercado Pago"
            value={formatPrice(paymentStats.totalMercadoPago)}
            icon={<MercadoPagoIcon />}
            gradient="from-sky-100 to-sky-300"
          />
          
          {/* Ingresos en Efectivo */}
          <StatsCard
            title="Ingresos en Efectivo"
            description="Total pagado en efectivo"
            value={formatPrice(paymentStats.totalEfectivo)}
            icon={<DollarSign className="h-5 w-5" />}
            gradient="from-yellow-100 to-yellow-300"
          />
        </div>
        
        <RevenueByMonth 
          revenueByMonth={revenueByMonth} 
          formatPrice={formatPrice} 
        />
        
        <CompletedAppointmentsTable 
          completedAppointments={completedAppointments}
          isLoading={isLoading}
          formatPrice={formatPrice}
        />
      </main>
    </div>
  );
};

export default AccountingPage;
