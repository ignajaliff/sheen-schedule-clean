
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCompletedAppointments, Appointment, getPaymentMethodStats } from "@/services/appointmentService";
import { toast } from "sonner";
import Header from "@/components/Header";

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
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Ingresos Totales</CardTitle>
              <CardDescription>Total de todos los servicios completados</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{formatPrice(totalRevenue)}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Servicios Completados</CardTitle>
              <CardDescription>Cantidad de servicios realizados</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{completedAppointments.length}</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Payment Method Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Ingresos en Efectivo</CardTitle>
              <CardDescription>Total pagado en efectivo</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{formatPrice(paymentStats.totalEfectivo)}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Ingresos en Mercado Pago</CardTitle>
              <CardDescription>Total pagado con Mercado Pago</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{formatPrice(paymentStats.totalMercadoPago)}</p>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Ingresos por Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mes</TableHead>
                    <TableHead>Ingresos</TableHead>
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
                      <TableRow key={month}>
                        <TableCell>{month}</TableCell>
                        <TableCell>{formatPrice(revenue)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Registro de Servicios Completados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              {isLoading ? (
                <div className="p-8 text-center">Cargando datos...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Servicio</TableHead>
                      <TableHead>Ubicación</TableHead>
                      <TableHead>Método de Pago</TableHead>
                      <TableHead className="text-right">Precio</TableHead>
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
                        <TableRow key={appointment.id}>
                          <TableCell>{appointment.date}</TableCell>
                          <TableCell>{appointment.clientName}</TableCell>
                          <TableCell>{appointment.serviceType}</TableCell>
                          <TableCell>{appointment.isHomeService ? "Domicilio" : "Taller"}</TableCell>
                          <TableCell>{appointment.paymentMethod || "No especificado"}</TableCell>
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
