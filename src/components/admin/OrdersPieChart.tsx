
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OrdersPieChartProps {
  orders: any[];
}

const OrdersPieChart = ({ orders }: OrdersPieChartProps) => {
  console.log('📊 Renderizando pie chart con órdenes:', orders.length);

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Estados de Órdenes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 text-lg mb-2">No hay órdenes para mostrar</p>
              <p className="text-gray-400 text-sm">Ajusta los filtros para ver datos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusCounts = orders.reduce((acc, order) => {
    const status = order.status || 'pending';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  console.log('📈 Status counts:', statusCounts);

  const data = [
    { name: 'Pendiente', value: statusCounts.pending || statusCounts.pendiente || 0, color: '#3B82F6' },
    { name: 'Procesando', value: statusCounts.processing || statusCounts.procesando || 0, color: '#EAB308' },
    { name: 'Completado', value: statusCounts.completed || statusCounts.completada || 0, color: '#22C55E' },
    { name: 'Cancelado', value: statusCounts.cancelled || statusCounts.cancelada || 0, color: '#EF4444' },
  ].filter(item => item.value > 0);

  console.log('📊 Chart data:', data);

  const COLORS = data.map(item => item.color);

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show label if less than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Estados de Órdenes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 text-lg mb-2">Todas las órdenes tienen el mismo estado</p>
              <p className="text-gray-400 text-sm">o no se encontraron órdenes con los filtros aplicados</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución de Estados de Órdenes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrdersPieChart;
