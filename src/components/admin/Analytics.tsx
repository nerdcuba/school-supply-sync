import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, School, Package, Laptop, Clock, CheckCircle, XCircle } from 'lucide-react';
import { dashboardService } from '@/services/dashboardService';
import { orderService } from '@/services/orderService';
import { electronicsService } from '@/services/electronicsService';

const Analytics = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSchools: 0,
    totalPacks: 0,
    totalElectronics: 0,
    totalRevenue: 0,
    avgOrderValue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [adminStats, allOrders, electronicsData] = await Promise.all([
        dashboardService.getAdminStats(),
        orderService.getAll(),
        electronicsService.getElectronics()
      ]);
      
      setStats({
        ...adminStats,
        totalElectronics: electronicsData.data.length
      });
      setRecentOrders(allOrders.slice(0, 10));
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener información de la escuela y grado desde los items de la orden
  const getOrderDetails = (order: any) => {
    console.log('📋 Analizando orden completa:', JSON.stringify(order, null, 2));
    
    // Primero verificar si ya tiene school_name y grade en la orden principal
    if (order.school_name && order.grade) {
      console.log('✅ Encontrado en orden principal:', { school: order.school_name, grade: order.grade });
      return {
        school: order.school_name,
        grade: order.grade
      };
    }

    // Si no, extraer de los items
    if (order.items && Array.isArray(order.items) && order.items.length > 0) {
      console.log('🔍 Analizando items de la orden:', JSON.stringify(order.items, null, 2));
      
      for (let i = 0; i < order.items.length; i++) {
        const item = order.items[i];
        console.log(`🔍 Item ${i}:`, JSON.stringify(item, null, 2));
        
        // Función auxiliar para extraer el valor del school
        const extractSchoolValue = (schoolField: any) => {
          if (typeof schoolField === 'string') {
            return schoolField;
          }
          if (schoolField && typeof schoolField === 'object') {
            return schoolField.value || schoolField.name || schoolField.school_name || String(schoolField);
          }
          return null;
        };

        // Buscar school_name y grade en diferentes posibles ubicaciones
        const schoolValue = extractSchoolValue(item.school_name) || extractSchoolValue(item.school);
        const gradeValue = item.grade;

        if (schoolValue || gradeValue) {
          console.log('✅ Encontrado en item directo:', { school: schoolValue, grade: gradeValue });
          return {
            school: schoolValue || order.school_name || 'Escuela no especificada',
            grade: gradeValue || order.grade || 'Grado no especificado'
          };
        }

        // Si el item tiene una propiedad anidada que contenga la info
        if (item.pack) {
          console.log('🔍 Verificando pack anidado:', JSON.stringify(item.pack, null, 2));
          const packSchoolValue = extractSchoolValue(item.pack.school_name) || extractSchoolValue(item.pack.school);
          if (packSchoolValue || item.pack.grade) {
            console.log('✅ Encontrado en pack anidado:', { school: packSchoolValue, grade: item.pack.grade });
            return {
              school: packSchoolValue || order.school_name || 'Escuela no especificada',
              grade: item.pack.grade || order.grade || 'Grado no especificado'
            };
          }
        }

        // Si el item es un pack con estructura diferente
        if (item.type === 'pack' && (item.schoolName || item.gradeName)) {
          console.log('✅ Encontrado en pack con estructura diferente:', { school: item.schoolName, grade: item.gradeName });
          return {
            school: item.schoolName || extractSchoolValue(item.school_name) || order.school_name || 'Escuela no especificada',
            grade: item.gradeName || item.grade || order.grade || 'Grado no especificado'
          };
        }
      }
    }

    console.log('❌ No se encontró información de escuela/grado, usando fallback');
    // Fallback a los valores de la orden principal
    return {
      school: order.school_name || 'Escuela no especificada',
      grade: order.grade || 'Grado no especificado'
    };
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendiente', variant: 'default' as const, icon: Clock, className: 'bg-blue-500 text-white hover:bg-blue-600' },
      processing: { label: 'Procesando', variant: 'default' as const, icon: Package, className: 'bg-yellow-500 text-white hover:bg-yellow-600' },
      completed: { label: 'Completado', variant: 'default' as const, icon: CheckCircle, className: 'bg-green-500 text-white hover:bg-green-600' },
      cancelled: { label: 'Cancelado', variant: 'default' as const, icon: XCircle, className: 'bg-red-500 text-white hover:bg-red-600' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={`flex items-center gap-1 ${config.className}`}>
        <Icon size={12} />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Cargando analíticas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Analíticas y Reportes</h2>
        <Badge variant="secondary">Actualizado ahora</Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Órdenes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              Órdenes procesadas
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Escuelas Registradas</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSchools}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              Instituciones activas
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Packs de Útiles</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPacks}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              Packs disponibles
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Electrónicos</CardTitle>
            <Laptop className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalElectronics}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              Productos disponibles
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              Promedio: ${stats.avgOrderValue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Órdenes Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No hay órdenes registradas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order: any) => {
                const orderDetails = getOrderDetails(order);
                return (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">Orden #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-600">
                        {orderDetails.school} - {orderDetails.grade}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${order.total}</p>
                      {getStatusBadge(order.status || 'pending')}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
