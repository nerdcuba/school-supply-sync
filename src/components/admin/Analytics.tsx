
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, ShoppingCart, School, Package, Laptop } from 'lucide-react';
import { dashboardService } from '@/services/dashboardService';
import { orderService } from '@/services/orderService';
import { electronicsService } from '@/services/electronicsService';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';
import OrdersPieChart from './OrdersPieChart';
import OrdersTable from './OrdersTable';
import FilterPanel from './FilterPanel';
import { isAfter, isBefore, isEqual, parseISO } from 'date-fns';

const Analytics = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSchools: 0,
    totalPacks: 0,
    totalElectronics: 0,
    totalRevenue: 0,
    avgOrderValue: 0
  });
  const [allOrders, setAllOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: null as Date | null,
    endDate: null as Date | null,
    school: '',
    status: '',
    orderId: ''
  });
  const [availableSchools, setAvailableSchools] = useState<string[]>([]);

  // Configurar realtime para actualizar automáticamente cuando cambien las órdenes
  useRealtimeOrders({
    onOrdersUpdate: () => {
      console.log('🔄 Actualizando analytics por cambio en órdenes...');
      loadAnalytics();
    },
    isAdmin: true
  });

  useEffect(() => {
    console.log('🔄 Cargando Analytics...');
    loadAnalytics();
  }, []);

  // Filter orders when filters change
  useEffect(() => {
    console.log('📅 Aplicando filtros...', filters);
    applyFilters();
  }, [allOrders, filters]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      console.log('📊 Obteniendo datos para Analytics...');
      const [adminStats, allOrdersData, electronicsData] = await Promise.all([
        dashboardService.getAdminStats(),
        orderService.getAll(),
        electronicsService.getElectronics()
      ]);
      
      console.log('📈 Estadísticas obtenidas:', { adminStats, ordersCount: allOrdersData.length, electronicsCount: electronicsData.data.length });
      
      setStats({
        ...adminStats,
        totalElectronics: electronicsData.data.length
      });
      setAllOrders(allOrdersData);
      setFilteredOrders(allOrdersData);

      // Extraer escuelas únicas para el filtro
      const schools = [...new Set(allOrdersData.map((order: any) => {
        const details = getOrderDetails(order);
        return details.school;
      }).filter(Boolean))].sort();
      setAvailableSchools(schools);
    } catch (error) {
      console.error('❌ Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allOrders];

    // Filtrar por fechas
    if (filters.startDate || filters.endDate) {
      filtered = filtered.filter((order: any) => {
        const orderDate = parseISO(order.created_at);
        
        if (filters.startDate && filters.endDate) {
          return (isEqual(orderDate, filters.startDate) || isAfter(orderDate, filters.startDate)) &&
                 (isEqual(orderDate, filters.endDate) || isBefore(orderDate, filters.endDate));
        } else if (filters.startDate) {
          return isEqual(orderDate, filters.startDate) || isAfter(orderDate, filters.startDate);
        } else if (filters.endDate) {
          return isEqual(orderDate, filters.endDate) || isBefore(orderDate, filters.endDate);
        }
        
        return true;
      });
    }

    // Filtrar por escuela
    if (filters.school) {
      filtered = filtered.filter((order: any) => {
        const details = getOrderDetails(order);
        return details.school.toLowerCase().includes(filters.school.toLowerCase());
      });
    }

    // Filtrar por estado
    if (filters.status) {
      filtered = filtered.filter((order: any) => {
        const status = normalizeStatus(order.status || 'pending');
        return status === filters.status;
      });
    }

    // Filtrar por ID de orden
    if (filters.orderId) {
      filtered = filtered.filter((order: any) => {
        return order.id.toLowerCase().includes(filters.orderId.toLowerCase());
      });
    }

    console.log('🔍 Órdenes filtradas:', { 
      original: allOrders.length, 
      filtered: filtered.length,
      filters 
    });
    setFilteredOrders(filtered);
  };

  const handleFiltersChange = (newFilters: typeof filters) => {
    console.log('📅 Cambio de filtros:', newFilters);
    setFilters(newFilters);
  };

  // Función mejorada para normalizar estados
  const normalizeStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'pending',
      'pendiente': 'pending',
      'processing': 'processing', 
      'procesando': 'processing',
      'completed': 'completed',
      'completada': 'completed',
      'cancelled': 'cancelled',
      'cancelada': 'cancelled'
    };
    
    return statusMap[status?.toLowerCase()] || 'pending';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Cargando analíticas...</div>
      </div>
    );
  }

  console.log('🎯 Renderizando Analytics con:', { 
    allOrdersCount: allOrders.length, 
    filteredOrdersCount: filteredOrders.length,
    stats 
  });

  const hasActiveFilters = filters.startDate || filters.endDate || filters.school || filters.status || filters.orderId;

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
            <div className="text-2xl font-bold">{filteredOrders.length}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              {hasActiveFilters ? 'Filtradas' : 'Órdenes procesadas'}
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
            <div className="text-2xl font-bold">
              ${filteredOrders.reduce((sum: number, order: any) => sum + order.total, 0).toFixed(2)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              {hasActiveFilters ? 'Período filtrado' : `Promedio: $${stats.avgOrderValue.toFixed(2)}`}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Panel */}
      <FilterPanel 
        onFiltersChange={handleFiltersChange}
        filters={filters}
        schools={availableSchools}
      />

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrdersPieChart orders={filteredOrders} />
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>
                {hasActiveFilters ? 'Resumen Filtrado' : 'Resumen General'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {filteredOrders.filter((o: any) => {
                      const status = normalizeStatus(o.status || 'pending');
                      return status === 'pending';
                    }).length}
                  </div>
                  <div className="text-sm text-blue-800">Pendientes</div>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {filteredOrders.filter((o: any) => {
                      const status = normalizeStatus(o.status || 'pending');
                      return status === 'processing';
                    }).length}
                  </div>
                  <div className="text-sm text-yellow-800">Procesando</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {filteredOrders.filter((o: any) => {
                      const status = normalizeStatus(o.status || 'pending');
                      return status === 'completed';
                    }).length}
                  </div>
                  <div className="text-sm text-green-800">Completadas</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {filteredOrders.filter((o: any) => {
                      const status = normalizeStatus(o.status || 'pending');
                      return status === 'cancelled';
                    }).length}
                  </div>
                  <div className="text-sm text-red-800">Canceladas</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Orders Table */}
      <OrdersTable 
        orders={filteredOrders} 
        getOrderDetails={getOrderDetails}
      />
    </div>
  );
};

export default Analytics;
