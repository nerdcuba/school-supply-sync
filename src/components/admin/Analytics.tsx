
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, ShoppingBag, DollarSign, Users } from 'lucide-react';

// Datos de ejemplo para las gráficas
const weeklyData = [
  { name: 'Lun', ventas: 12, importe: 342 },
  { name: 'Mar', ventas: 19, importe: 452 },
  { name: 'Mié', ventas: 10, importe: 290 },
  { name: 'Jue', ventas: 15, importe: 380 },
  { name: 'Vie', ventas: 24, importe: 580 },
  { name: 'Sáb', ventas: 18, importe: 460 },
  { name: 'Dom', ventas: 7, importe: 210 }
];

const monthlyData = [
  { name: 'Ene', ventas: 65, importe: 1890 },
  { name: 'Feb', ventas: 59, importe: 1700 },
  { name: 'Mar', ventas: 80, importe: 2300 },
  { name: 'Abr', ventas: 81, importe: 2490 },
  { name: 'May', ventas: 56, importe: 1560 },
  { name: 'Jun', ventas: 55, importe: 1670 },
  { name: 'Jul', ventas: 40, importe: 1200 },
  { name: 'Ago', ventas: 70, importe: 2100 },
  { name: 'Sep', ventas: 90, importe: 2800 },
  { name: 'Oct', ventas: 110, importe: 3400 },
  { name: 'Nov', ventas: 130, importe: 3900 },
  { name: 'Dic', ventas: 125, importe: 3700 }
];

const topPacksData = [
  { name: 'Pack 3er Grado - Redland', value: 35 },
  { name: 'Pack 1er Grado - Sunset', value: 30 },
  { name: 'Pack 2do Grado - Coral Gables', value: 25 },
  { name: 'Pack 4to Grado - Palmetto', value: 20 },
  { name: 'Pack Kinder - Southwood', value: 15 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Analytics = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Panel Analítico</h2>
      
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$24,560</div>
            <p className="text-xs text-muted-foreground">
              +15% respecto al mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">825</div>
            <p className="text-xs text-muted-foreground">
              +5% respecto al mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Packs Vendidos</CardTitle>
            <PackageOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,245</div>
            <p className="text-xs text-muted-foreground">
              +20% respecto al mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">652</div>
            <p className="text-xs text-muted-foreground">
              +12% respecto al mes anterior
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Ventas por Período</CardTitle>
            <CardDescription>
              Visión general de ventas por período de tiempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="weekly" className="space-y-4">
              <TabsList>
                <TabsTrigger value="weekly">Semanal</TabsTrigger>
                <TabsTrigger value="monthly">Mensual</TabsTrigger>
              </TabsList>
              <TabsContent value="weekly">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="ventas" name="Unidades" fill="#8884d8" />
                    <Bar yAxisId="right" dataKey="importe" name="Ventas ($)" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="monthly">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="ventas" name="Unidades" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line yAxisId="right" type="monotone" dataKey="importe" name="Ventas ($)" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Packs Vendidos</CardTitle>
            <CardDescription>Los packs más populares</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  dataKey="value"
                  isAnimationActive={true}
                  data={topPacksData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {topPacksData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Ventas</CardTitle>
            <CardDescription>Evolución de ventas en el último mes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="importe" name="Ventas ($)" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
