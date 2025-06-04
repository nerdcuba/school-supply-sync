
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import { orderService, Order } from '@/services/orderService';
import { useToast } from '@/hooks/use-toast';

const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAll();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las órdenes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      await loadOrders();
      toast({
        title: "Estado actualizado",
        description: "El estado de la orden ha sido actualizado correctamente",
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la orden",
        variant: "destructive",
      });
    }
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
            Administra todas las órdenes del sistema ({orders.length} órdenes)
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                {orders.map((order) => (
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
                          className="px-2 py-1 border rounded text-sm bg-white"
                        >
                          <option value="pending">Pendiente</option>
                          <option value="processing">Procesando</option>
                          <option value="completed">Completado</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {orders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay órdenes registradas
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderManagement;
