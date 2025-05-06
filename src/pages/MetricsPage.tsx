
import { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, PieChart, Pie, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import { getAppointmentStats } from "@/services/appointmentService";
import { Settings, ChartBarIcon, ChartPie, TrendingUp, Award } from "lucide-react";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";

const MetricsPage = () => {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    cancelled: 0,
    pending: 0,
    completionRate: 0,
    homeServices: 0,
    workshopServices: 0,
    serviceTypes: {} as Record<string, number>
  });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      try {
        const statsData = await getAppointmentStats();
        setStats(statsData);
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStats();
  }, []);
  
  // Datos para el gráfico circular con colores profesionales
  const statusData = [
    { name: 'Completados', value: stats.completed, color: 'hsl(145, 63%, 42%)' },
    { name: 'Pendientes', value: stats.pending, color: 'hsl(43, 96%, 58%)' },
    { name: 'Cancelados', value: stats.cancelled, color: 'hsl(0, 79%, 63%)' }
  ];
  
  // Datos para el gráfico de barras
  const locationData = [
    { name: 'Taller', value: stats.workshopServices, color: 'hsl(210, 79%, 46%)' },
    { name: 'Domicilio', value: stats.homeServices, color: 'hsl(354, 70%, 54%)' }
  ];
  
  // Datos para el gráfico de servicios con gradiente de colores
  const serviceData = Object.entries(stats.serviceTypes).map(([name, value], index) => ({
    name,
    value,
    color: `hsl(${210 + index * 20}, 70%, ${45 + index * 5}%)`
  }));

  // Config para chart
  const chartConfig = {
    completed: {
      label: "Completados",
      theme: { light: "hsl(145, 63%, 42%)", dark: "hsl(145, 63%, 50%)" },
    },
    pending: {
      label: "Pendientes",
      theme: { light: "hsl(43, 96%, 58%)", dark: "hsl(43, 96%, 65%)" },
    },
    cancelled: {
      label: "Cancelados",
      theme: { light: "hsl(0, 79%, 63%)", dark: "hsl(0, 79%, 70%)" },
    },
    workshop: {
      label: "Taller",
      theme: { light: "hsl(210, 79%, 46%)", dark: "hsl(210, 79%, 55%)" },
    },
    home: {
      label: "Domicilio",
      theme: { light: "hsl(354, 70%, 54%)", dark: "hsl(354, 70%, 60%)" },
    },
  };

  if (isLoading) {
    return (
      <div className="pb-20 md:pb-5 md:pl-20">
        <Header title="Estadísticas" />
        <main className="pt-20 px-4 flex justify-center items-center">
          <p>Cargando estadísticas...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-5 md:pl-20">
      <Header title="Estadísticas" />
      
      <main className="pt-20 px-4 max-w-6xl mx-auto">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Card className="cleanly-card bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-gray-500">Total de Turnos</CardTitle>
              <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-1">
                <p className="text-3xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">
                  Período actual: Esta semana
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="cleanly-card bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-gray-500">Tasa de Cumplimiento</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-2">
                <p className="text-3xl font-bold">{stats.completionRate.toFixed(1)}%</p>
                <Progress value={stats.completionRate} className="h-2" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="cleanly-card bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-gray-500">Turnos Completados</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-1">
                <p className="text-3xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">
                  De un total de {stats.total} turnos
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="cleanly-card h-[370px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex flex-col space-y-1">
                <CardTitle className="text-lg font-medium">Estado de Turnos</CardTitle>
                <p className="text-xs text-muted-foreground">Distribución por estado</p>
              </div>
              <ChartPie className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <ChartContainer className="h-[300px]" config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
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
                      nameKey="name"
                    >
                      {statusData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          strokeWidth={1}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
          
          <Card className="cleanly-card h-[370px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex flex-col space-y-1">
                <CardTitle className="text-lg font-medium">Ubicación de Servicios</CardTitle>
                <p className="text-xs text-muted-foreground">Comparativa de servicios</p>
              </div>
              <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <ChartContainer className="h-[300px]" config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={locationData}>
                    <defs>
                      {locationData.map((entry, index) => (
                        <linearGradient
                          key={`gradient-${index}`}
                          id={`gradient-${index}`}
                          x1="0" y1="0" x2="0" y2="1"
                        >
                          <stop offset="5%" stopColor={entry.color} stopOpacity={0.8} />
                          <stop offset="95%" stopColor={entry.color} stopOpacity={0.4} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#888', fontSize: 12 }}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis 
                      allowDecimals={false} 
                      tick={{ fill: '#888', fontSize: 12 }}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="value" 
                      name="Cantidad"
                      barSize={50}
                      radius={[4, 4, 0, 0]}
                    >
                      {locationData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={`url(#gradient-${index})`}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
        
        <Card className="cleanly-card mb-6">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex flex-col space-y-1">
              <CardTitle className="text-lg font-medium">Tipos de Servicio</CardTitle>
              <p className="text-xs text-muted-foreground">Distribución de servicios por tipo</p>
            </div>
            <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
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
                  <defs>
                    {serviceData.map((entry, index) => (
                      <linearGradient
                        key={`gradient-service-${index}`}
                        id={`gradient-service-${index}`}
                        x1="0" y1="0" x2="1" y2="0"
                      >
                        <stop offset="5%" stopColor={entry.color} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={entry.color} stopOpacity={0.6} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={true} />
                  <XAxis 
                    type="number" 
                    tick={{ fill: '#888', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={150} 
                    tick={{ fontSize: 12, fill: '#666' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    name="Cantidad"
                    barSize={20}
                    radius={[0, 4, 4, 0]}
                  >
                    {serviceData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#gradient-service-${index})`}
                      />
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
