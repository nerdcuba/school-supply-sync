
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Eye, Package, Clock, CheckCircle, XCircle, Search, Filter, CalendarIcon, X } from 'lucide-react';
import { orderService, Order } from '@/services/orderService';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface FilterState {
  searchTerm: string;
  status: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
}

const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    status: 'all',
    dateFrom: undefined,
    dateTo: undefined
  });
  const { toast } = useToast();

  const loadOrders = async () => {
    try {
      setLoading(true);
      console.log('📦 Cargando órdenes desde admin...');
      const data = await orderService.getAll();
      console.log('✅ Órdenes cargadas:', data.length);
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las órdenes. Verifica que tienes permisos de administrador.",
        variant: "destructive",
      });
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Configurar realtime updates
  useRealtimeOrders({
    onOrdersUpdate: () => {
      console.log('🔄 Recargando órdenes por cambio realtime...');
      loadOrders();
    },
    isAdmin: true
  });

  useEffect(() => {
    loadOrders();
  }, []);

  // Aplicar filtros cuando cambien los criterios o las órdenes
  useEffect(() => {
    applyFilters();
  }, [filters, orders]);

  const applyFilters = () => {
    let filtered = [...orders];

    // Filtro por término de búsqueda (cliente, ID de orden, escuela)
    if (filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(order => {
        const customerName = getCustomerName(order).toLowerCase();
        const schoolName = getSchoolFromOrder(order).toLowerCase();
        const orderId = order.id.toLowerCase();
        
        return customerName.includes(searchLower) ||
               schoolName.includes(searchLower) ||
               orderId.includes(searchLower);
      });
    }

    // Filtro por estado
    if (filters.status !== 'all') {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    // Filtro por rango de fechas
    if (filters.dateFrom) {
      filtered = filtered.filter(order => {
        if (!order.created_at) return false;
        const orderDate = new Date(order.created_at);
        return orderDate >= filters.dateFrom!;
      });
    }

    if (filters.dateTo) {
      filtered = filtered.filter(order => {
        if (!order.created_at) return false;
        const orderDate = new Date(order.created_at);
        // Agregar 23:59:59 al final del día seleccionado
        const endOfDay = new Date(filters.dateTo!);
        endOfDay.setHours(23, 59, 59, 999);
        return orderDate <= endOfDay;
      });
    }

    setFilteredOrders(filtered);
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      status: 'all',
      dateFrom: undefined,
      dateTo: undefined
    });
  };

  const hasActiveFilters = () => {
    return filters.searchTerm.trim() !== '' ||
           filters.status !== 'all' ||
           filters.dateFrom !== undefined ||
           filters.dateTo !== undefined;
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrderId(orderId);
      console.log(`🔄 Actualizando orden ${orderId} a estado: ${newStatus}`);
      
      // Verificar que la orden existe localmente antes de actualizar
      const orderExists = orders.find(order => order.id === orderId);
      if (!orderExists) {
        throw new Error('La orden no existe en el estado local');
      }
      
      // Actualizar en base de datos y obtener la orden actualizada
      const updatedOrder = await orderService.updateStatus(orderId, newStatus);
      
      console.log('✅ Estado actualizado correctamente en base de datos:', updatedOrder);
      
      // Actualizar el estado local con la orden completa desde la base de datos
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? updatedOrder : order
        )
      );
      
      toast({
        title: "Estado actualizado",
        description: `El estado de la orden ha sido cambiado a ${getStatusLabel(newStatus)}`,
      });
      
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      toast({
        title: "Error",
        description: `No se pudo actualizar el estado de la orden: ${errorMessage}`,
        variant: "destructive",
      });
      
      // Recargar datos en caso de error para asegurar consistencia
      console.log('🔄 Recargando datos tras error...');
      await loadOrders();
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusLabel = (status: string) => {
    const statusLabels = {
      pending: 'Pendiente',
      processing: 'Procesando',
      completed: 'Completado',
      cancelled: 'Cancelado',
    };
    return statusLabels[status as keyof typeof statusLabels] || status;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendiente', variant: 'secondary' as const, icon: Clock },
      processing: { label: 'Procesando', variant: 'default' as const, icon: Package },
      completed: { label: 'Completado', variant: 'default' as const, icon: CheckCircle },
      cancelled: { label: 'Cancelado', variant: 'destructive' as const, icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon size={12} />
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCustomerName = (order: Order) => {
    // Try to extract customer name from order items or user_id
    if (order.items && order.items.length > 0) {
      const firstItem = order.items[0];
      if (firstItem.customer_name) {
        return firstItem.customer_name;
      }
    }
    return order.user_id ? order.user_id.slice(0, 8) + '...' : 'Usuario invitado';
  };

  const getSchoolFromOrder = (order: Order) => {
    if (order.school_name) return order.school_name;
    if (order.items && order.items.length > 0) {
      const firstItem = order.items[0];
      if (firstItem.school) return firstItem.school;
    }
    return 'N/A';
  };

  const getGradeFromOrder = (order: Order) => {
    if (order.grade) return order.grade;
    if (order.items && order.items.length > 0) {
      const firstItem = order.items[0];
      if (firstItem.grade) return firstItem.grade;
    }
    return 'N/A';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Gestión de Órdenes
          </CardTitle>
          <CardDescription>
            Administra todas las órdenes del sistema ({filteredOrders.length} de {orders.length} órdenes)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtros y Búsqueda */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Búsqueda */}
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por cliente, escuela o ID de orden..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filtro por Estado */}
              <Select 
                value={filters.status} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="processing">Procesando</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>

              {/* Filtro por Fecha Desde */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-48 justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateFrom ? format(filters.dateFrom, "dd/MM/yyyy") : "Fecha desde"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateFrom}
                    onSelect={(date) => setFilters(prev => ({ ...prev, dateFrom: date }))}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>

              {/* Filtro por Fecha Hasta */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-48 justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateTo ? format(filters.dateTo, "dd/MM/yyyy") : "Fecha hasta"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateTo}
                    onSelect={(date) => setFilters(prev => ({ ...prev, dateTo: date }))}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>

              {/* Botón para limpiar filtros */}
              {hasActiveFilters() && (
                <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
                  <X className="h-4 w-4" />
                  Limpiar filtros
                </Button>
              )}

              {/* Botón recargar */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadOrders}
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Recargar
              </Button>
            </div>

            {/* Indicadores de filtros activos */}
            {hasActiveFilters() && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Filter className="h-4 w-4" />
                <span>Filtros activos:</span>
                {filters.searchTerm && <Badge variant="secondary">Búsqueda: "{filters.searchTerm}"</Badge>}
                {filters.status !== 'all' && <Badge variant="secondary">Estado: {getStatusLabel(filters.status)}</Badge>}
                {filters.dateFrom && <Badge variant="secondary">Desde: {format(filters.dateFrom, "dd/MM/yyyy")}</Badge>}
                {filters.dateTo && <Badge variant="secondary">Hasta: {format(filters.dateTo, "dd/MM/yyyy")}</Badge>}
              </div>
            )}
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Escuela</TableHead>
                  <TableHead>Grado</TableHead>
                  <TableHead>Total Pagado</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">
                      {order.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      {order.created_at ? formatDate(order.created_at) : 'N/A'}
                    </TableCell>
                    <TableCell>{getCustomerName(order)}</TableCell>
                    <TableCell>{getSchoolFromOrder(order)}</TableCell>
                    <TableCell>{getGradeFromOrder(order)}</TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(order.total)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(order.status || 'pending')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Detalles de la Orden</DialogTitle>
                            </DialogHeader>
                            {selectedOrder && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="font-semibold">ID de Orden:</label>
                                    <p className="font-mono text-sm">{selectedOrder.id}</p>
                                  </div>
                                  <div>
                                    <label className="font-semibold">Estado:</label>
                                    <div className="mt-1">
                                      {getStatusBadge(selectedOrder.status || 'pending')}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="font-semibold">Fecha:</label>
                                    <p>{selectedOrder.created_at ? formatDate(selectedOrder.created_at) : 'N/A'}</p>
                                  </div>
                                  <div>
                                    <label className="font-semibold">Total:</label>
                                    <p className="text-lg font-bold text-green-600">
                                      {formatCurrency(selectedOrder.total)}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="font-semibold">Cliente:</label>
                                    <p>{getCustomerName(selectedOrder)}</p>
                                  </div>
                                  <div>
                                    <label className="font-semibold">Escuela:</label>
                                    <p>{getSchoolFromOrder(selectedOrder)}</p>
                                  </div>
                                  <div>
                                    <label className="font-semibold">Grado:</label>
                                    <p>{getGradeFromOrder(selectedOrder)}</p>
                                  </div>
                                </div>

                                <div>
                                  <label className="font-semibold">Artículos:</label>
                                  <div className="mt-2 border rounded-lg p-4 bg-gray-50">
                                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                      <div className="space-y-2">
                                        {selectedOrder.items.map((item: any, index: number) => (
                                          <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                                            <div>
                                              <p className="font-medium">{item.name || 'Artículo sin nombre'}</p>
                                              <p className="text-sm text-gray-600">
                                                Cantidad: {item.quantity || 1}
                                              </p>
                                              {item.supplies && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                  Incluye: {item.supplies.map((supply: any) => supply.name).join(', ')}
                                                </div>
                                              )}
                                            </div>
                                            <p className="font-semibold">
                                              {formatCurrency(item.price || 0)}
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-gray-500">No hay artículos disponibles</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <select
                          value={order.status || 'pending'}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          disabled={updatingOrderId === order.id}
                          className="px-2 py-1 border rounded text-sm bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="pending">Pendiente</option>
                          <option value="processing">Procesando</option>
                          <option value="completed">Completado</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                        {updatingOrderId === order.id && (
                          <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      {hasActiveFilters() ? 'No se encontraron órdenes que coincidan con los filtros aplicados' : 'No hay órdenes registradas en el sistema'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderManagement;
