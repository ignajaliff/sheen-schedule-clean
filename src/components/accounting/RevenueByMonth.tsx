
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type RevenueByMonthProps = {
  revenueByMonth: Record<string, number>;
  formatPrice: (price: number) => string;
};

const RevenueByMonth = ({ revenueByMonth, formatPrice }: RevenueByMonthProps) => {
  return (
    <Card className="mb-6 border border-gray-300 shadow-md">
      <CardHeader className="bg-gray-50 border-b">
        <CardTitle className="text-gray-800">Ingresos por Mes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-bold text-gray-700">Mes</TableHead>
                <TableHead className="font-bold text-gray-700">Ingresos</TableHead>
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
                    <TableCell className="font-medium text-gray-700">{formatPrice(revenue)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueByMonth;
