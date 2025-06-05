
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Clock, CheckCircle, XCircle, Package, ShoppingCart } from 'lucide-react';

interface OrdersTableProps {
  orders: any[];
  getOrderDetails: (order: any) => { school: string; grade: string };
}

const OrdersTable = ({ orders, getOrderDetails }: OrdersTableProps) => {
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(orders.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedOrders = orders.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    // Normalizar el estado para manejar diferentes formatos
    const normalizedStatus = status?.toLowerCase() || 'pending';
    
    const statusConfig = {
      pending: { label: 'Pendiente', variant: 'default' as const, icon: Clock, className: 'bg-blue-500 text-white hover:bg-blue-600' },
      pendiente: { label: 'Pendiente', variant: 'default' as const, icon: Clock, className: 'bg-blue-500 text-white hover:bg-blue-600' },
      processing: { label: 'Procesando', variant: 'default' as const, icon: Package, className: 'bg-yellow-500 text-white hover:bg-yellow-600' },
      procesando: { label: 'Procesando', variant: 'default' as const, icon: Package, className: 'bg-yellow-500 text-white hover:bg-yellow-600' },
      completed: { label: 'Completado', variant: 'default' as const, icon: CheckCircle, className: 'bg-green-500 text-white hover:bg-green-600' },
      completada: { label: 'Completado', variant: 'default' as const, icon: CheckCircle, className: 'bg-green-500 text-white hover:bg-green-600' },
      cancelled: { label: 'Cancelado', variant: 'default' as const, icon: XCircle, className: 'bg-red-500 text-white hover:bg-red-600' },
      cancelada: { label: 'Cancelado', variant: 'default' as const, icon: XCircle, className: 'bg-red-500 text-white hover:bg-red-600' },
    };

    const config = statusConfig[normalizedStatus as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={`flex items-center gap-1 ${config.className}`}>
        <Icon size={12} />
        {config.label}
      </Badge>
    );
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(Number(newPageSize));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Órdenes Recientes</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Mostrar:</span>
            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-600">por página</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No hay órdenes registradas</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Orden</TableHead>
                  <TableHead>Escuela</TableHead>
                  <TableHead>Grado</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.map((order: any) => {
                  const orderDetails = getOrderDetails(order);
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">
                        #{order.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>{orderDetails.school}</TableCell>
                      <TableCell>{orderDetails.grade}</TableCell>
                      <TableCell className="font-semibold">${order.total}</TableCell>
                      <TableCell>{getStatusBadge(order.status || 'pending')}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 px-2">
                <div className="text-sm text-gray-600">
                  Mostrando {startIndex + 1}-{Math.min(endIndex, orders.length)} de {orders.length} órdenes
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let page;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }
                      
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={page === currentPage}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default OrdersTable;
