
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCompletedAppointments, Appointment, getPaymentMethodStats } from "@/services/appointmentService";
import { toast } from "sonner";
import Header from "@/components/Header";
import { DollarSign, Coins, CheckCheck, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const AccountingPage = () => {
  const [completedAppointments, setCompletedAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStats, setPaymentStats] = useState({
    totalEfectivo: 0,
    totalMercadoPago: 0
  });
  
  useEffect(() => {
    loadCompletedAppointments();
  }, []);
  
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
  
  const revenueByMonth = calculateRevenueByMonth();
  const totalRevenue = calculateTotalRevenue();
  
  return (
    <div className="pb-20 md:pb-5 md:pl-20">
      <Header title="Contabilidad" />
      
      <main className="pt-20 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Ingresos Totales - Verde más oscuro */}
          <Card className="overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-700/20 to-green-600/5 z-0" />
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Coins className="h-5 w-5" />
                Ingresos Totales
              </CardTitle>
              <CardDescription>Total de todos los servicios completados</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-3xl font-bold text-green-800">{formatPrice(totalRevenue)}</p>
            </CardContent>
          </Card>
          
          {/* Servicios Completados - Amarillo */}
          <Card className="overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 to-yellow-50 z-0" />
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="flex items-center gap-2 text-yellow-700">
                <CheckCheck className="h-5 w-5" />
                Servicios Completados
              </CardTitle>
              <CardDescription>Cantidad de servicios realizados</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-3xl font-bold text-yellow-700">{completedAppointments.length}</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Payment Method Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Mercado Pago - Celeste con blanco */}
          <Card className="overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-white z-0" />
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 6.982h3.154v10.037H0V6.982z" fill="#009EE3"/>
                    <path d="M12.154 6.982h3.154v10.037h-3.154V6.982z" fill="#009EE3"/>
                    <path d="M17.654 6.982h3.154v10.037h-3.154V6.982z" fill="#009EE3"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M3.154 6.982h4.5c2.307 0 3.5 1.194 3.5 3.244v6.793h-3.26V10.73c0-.614-.392-.824-.95-.824h-3.79V6.982z" fill="#009EE3"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M22.11 12.113c-.02-3.334-2.062-5.424-5.382-5.424H11v2.924h3.633c1.356 0 2.268.745 2.268 2.021v5.385h3.174v-3.143c1.343-.604 2.004-1.321 2.036-1.763z" fill="#009EE3"/>
                  </svg>
                  Ingresos en Mercado Pago
                </div>
              </CardTitle>
              <CardDescription>Total pagado con Mercado Pago</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-3xl font-bold text-blue-700">{formatPrice(paymentStats.totalMercadoPago)}</p>
            </CardContent>
          </Card>
          
          {/* Ingresos en Efectivo - Verde claro */}
          <Card className="overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-white z-0" />
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="flex items-center gap-2 text-green-700">
                <DollarSign className="h-5 w-5" />
                Ingresos en Efectivo
              </CardTitle>
              <CardDescription>Total pagado en efectivo</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-3xl font-bold text-green-700">{formatPrice(paymentStats.totalEfectivo)}</p>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-6 border-2 border-gray-200">
          <CardHeader>
            <CardTitle>Ingresos por Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-bold">Mes</TableHead>
                    <TableHead className="font-bold">Ingresos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(revenueByMonth).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center h-16">
                        No hay datos disponibles
                      </TableCell>
                    </TableRow>
                  ) : (
                    Object.entries(revenueByMonth).map(([month, revenue]) => (
                      <TableRow key={month} className="hover:bg-slate-50">
                        <TableCell>{month}</TableCell>
                        <TableCell className="font-medium text-green-700">{formatPrice(revenue)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-gray-200">
          <CardHeader className="bg-slate-50">
            <CardTitle>Registro de Servicios Completados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              {isLoading ? (
                <div className="p-8 text-center">Cargando datos...</div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-bold">Fecha</TableHead>
                      <TableHead className="font-bold">Cliente</TableHead>
                      <TableHead className="font-bold">Servicio</TableHead>
                      <TableHead className="font-bold">Ubicación</TableHead>
                      <TableHead className="font-bold">Método de Pago</TableHead>
                      <TableHead className="font-bold text-right">Precio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedAppointments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24">
                          No hay servicios completados
                        </TableCell>
                      </TableRow>
                    ) : (
                      completedAppointments.map((appointment) => (
                        <TableRow key={appointment.id} className="hover:bg-slate-50">
                          <TableCell>{appointment.date}</TableCell>
                          <TableCell>{appointment.clientName}</TableCell>
                          <TableCell>{appointment.serviceType}</TableCell>
                          <TableCell>{appointment.isHomeService ? "Domicilio" : "Taller"}</TableCell>
                          <TableCell>
                            <div className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium w-fit",
                              appointment.paymentMethod === "Mercado Pago" 
                                ? "bg-blue-100 text-blue-700"
                                : "bg-green-100 text-green-700"
                            )}>
                              {appointment.paymentMethod || "No especificado"}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatPrice(appointment.price || 0)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AccountingPage;
