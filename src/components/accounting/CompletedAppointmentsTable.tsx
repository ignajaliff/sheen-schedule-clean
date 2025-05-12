
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Appointment } from "@/services/appointmentService";

type CompletedAppointmentsTableProps = {
  completedAppointments: Appointment[];
  isLoading: boolean;
  formatPrice: (price: number) => string;
};

const CompletedAppointmentsTable = ({ 
  completedAppointments, 
  isLoading, 
  formatPrice 
}: CompletedAppointmentsTableProps) => {
  return (
    <Card className="border border-gray-300 shadow-md">
      <CardHeader className="bg-gray-50 border-b">
        <CardTitle className="text-gray-800">Registro de Servicios Completados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          {isLoading ? (
            <div className="p-8 text-center">Cargando datos...</div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-bold text-gray-700">Fecha</TableHead>
                  <TableHead className="font-bold text-gray-700">Cliente</TableHead>
                  <TableHead className="font-bold text-gray-700">Servicio</TableHead>
                  <TableHead className="font-bold text-gray-700">Ubicación</TableHead>
                  <TableHead className="font-bold text-gray-700">Método de Pago</TableHead>
                  <TableHead className="font-bold text-gray-700 text-right">Precio</TableHead>
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
  );
};

export default CompletedAppointmentsTable;
