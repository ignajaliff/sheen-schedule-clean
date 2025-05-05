
import { BarChart, PieChart, Pie, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import { getAppointmentStats } from "@/services/appointmentService";
import { Settings } from "lucide-react";

const MetricsPage = () => {
  const stats = getAppointmentStats();
  
  // Datos para el gráfico circular
  const statusData = [
    { name: 'Completados', value: stats.completed, color: '#4CAF50' },
    { name: 'Pendientes', value: stats.pending, color: '#FFC107' },
    { name: 'Cancelados', value: stats.cancelled, color: '#F44336' }
  ];
  
  // Datos para el gráfico de barras
  const locationData = [
    { name: 'Taller', value: stats.workshopServices, color: '#1E88E5' },
    { name: 'Domicilio', value: stats.homeServices, color: '#E53935' }
  ];
  
  // Datos para el gráfico de servicios
  const serviceData = Object.entries(stats.serviceTypes).map(([name, value], index) => ({
    name,
    value,
    color: `hsl(${index * 30}, 70%, 50%)`
  }));

  return (
    <div className="pb-20 md:pb-5 md:pl-20">
      <Header title="Estadísticas" />
      
      <main className="pt-20 px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <Card className="cleanly-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">Total de Turnos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          
          <Card className="cleanly-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">Tasa de Cumplimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.completionRate.toFixed(1)}%</p>
            </CardContent>
          </Card>
          
          <Card className="cleanly-card">
            <CardHeader className="pb-2 flex justify-between items-center">
              <CardTitle className="text-sm text-gray-500">Período</CardTitle>
              <Settings size={16} className="text-gray-400 cursor-pointer" />
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">Esta semana</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="cleanly-card h-[350px]">
            <CardHeader>
              <CardTitle>Estado de Turnos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card className="cleanly-card h-[350px]">
            <CardHeader>
              <CardTitle>Ubicación de Servicios</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={locationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Cantidad">
                    {locationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        
        <Card className="cleanly-card mb-6">
          <CardHeader>
            <CardTitle>Tipos de Servicio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={serviceData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 60,
                  }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Cantidad">
                    {serviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MetricsPage;
