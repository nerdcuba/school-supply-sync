import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Search, UserRound, Mail, Calendar, Clock, Trash2, Eye, ShoppingBag, RefreshCw } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

interface UserType {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  role: string;
  phone?: string;
  address?: string;
  orders?: OrderType[];
}

interface OrderType {
  id: string;
  date: string;
  total: number;
  status: string;
  items: any[];
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('=== INICIANDO CARGA DE USUARIOS ===');
      
      // Primero, verificar la conexión a Supabase
      console.log('Verificando conexión a Supabase...');
      const { data: testConnection, error: connectionError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (connectionError) {
        console.error('Error de conexión a Supabase:', connectionError);
        throw connectionError;
      }
      
      console.log('Conexión a Supabase exitosa');

      // Cargar todos los perfiles
      console.log('Consultando tabla profiles...');
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Respuesta de profiles:', { profiles, error: profilesError });

      if (profilesError) {
        console.error('Error cargando perfiles:', profilesError);
        toast({
          title: "Error",
          description: `Error al cargar los usuarios: ${profilesError.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log(`Se encontraron ${profiles?.length || 0} perfiles en la base de datos`);

      if (!profiles || profiles.length === 0) {
        console.log('No hay perfiles en la base de datos. Verificando tabla auth.users...');
        
        // Intentar obtener usuarios de auth directamente (esto no debería funcionar por RLS, pero lo intentamos)
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        console.log('Usuarios en auth:', { authUsers, error: authError });
        
        setUsers([]);
        toast({
          title: "Información",
          description: "No se encontraron usuarios registrados. Si acabas de registrar un usuario, el perfil debería crearse automáticamente.",
        });
        return;
      }

      // Cargar órdenes para cada usuario
      console.log('Cargando órdenes para cada usuario...');
      const usersWithOrders = await Promise.all(
        profiles.map(async (profile) => {
          console.log(`Cargando órdenes para usuario ${profile.id}...`);
          
          const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false });

          if (ordersError) {
            console.error(`Error cargando órdenes para usuario ${profile.id}:`, ordersError);
          }

          const formattedOrders = (orders || []).map(order => ({
            id: order.id,
            date: order.created_at,
            total: order.total,
            status: order.status || 'Completado',
            items: Array.isArray(order.items) ? order.items : []
          }));

          return {
            id: profile.id,
            name: profile.name || 'Sin nombre',
            email: profile.email || 'Sin email',
            createdAt: profile.created_at,
            role: profile.role || 'Cliente',
            phone: profile.phone || undefined,
            address: profile.address || undefined,
            orders: formattedOrders
          };
        })
      );

      console.log('Usuarios procesados con órdenes:', usersWithOrders);
      setUsers(usersWithOrders);
      
      toast({
        title: "Éxito",
        description: `Se cargaron ${usersWithOrders.length} usuarios correctamente.`,
      });

    } catch (error) {
      console.error('Error general cargando usuarios:', error);
      toast({
        title: "Error",
        description: "Error inesperado al cargar los usuarios. Revisa la consola para más detalles.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para crear perfiles manualmente para usuarios existentes
  const createMissingProfiles = async () => {
    try {
      console.log('Intentando crear perfiles para usuarios existentes...');
      
      // Esta operación requiere privilegios de admin, normalmente no funcionaría desde el frontend
      const { data: authUsers, error } = await supabase.auth.admin.listUsers();
      
      if (error) {
        console.error('No se pueden obtener usuarios de auth:', error);
        toast({
          title: "Información",
          description: "No se pueden crear perfiles automáticamente. Los nuevos usuarios registrados tendrán perfiles creados automáticamente.",
        });
        return;
      }

      console.log('Usuarios de auth encontrados:', authUsers);
      
      // Aquí normalmente crearíamos los perfiles faltantes, pero esto requiere privilegios especiales
      toast({
        title: "Información",
        description: "Esta función requiere privilegios especiales. Los nuevos registros crearán perfiles automáticamente.",
      });
      
    } catch (error) {
      console.error('Error creando perfiles:', error);
    }
  };

  // Filtrar usuarios según término de búsqueda
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Eliminar usuario
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userToDelete.id);

      if (error) {
        console.error('Error deleting user:', error);
        toast({
          title: "Error",
          description: "Error al eliminar el usuario",
          variant: "destructive",
        });
        return;
      }

      // Actualizar la lista local
      setUsers(prev => prev.filter(user => user.id !== userToDelete.id));
      setUserToDelete(null);
      setDeleteDialogOpen(false);
      
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado con éxito"
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Error al eliminar el usuario",
        variant: "destructive",
      });
    }
  };

  // Formato de fecha
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: es });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Gestión de Usuarios</h2>
          <Button variant="outline" onClick={loadUsers} disabled>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Cargando...
          </Button>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Cargando usuarios...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Gestión de Usuarios</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={createMissingProfiles}>
            Crear Perfiles Faltantes
          </Button>
          <Button variant="outline" onClick={loadUsers}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          className="pl-10"
          placeholder="Buscar usuarios por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Información de usuarios */}
      {users.length === 0 ? (
        <Card className="text-center p-10">
          <CardContent className="pt-10">
            <UserRound className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold">No hay usuarios registrados</h3>
            <p className="mt-2 text-sm text-gray-500">
              Los usuarios aparecerán aquí después de registrarse en la aplicación.
            </p>
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800 font-medium">Instrucciones de depuración:</p>
              <p className="text-xs text-yellow-700 mt-1">
                1. Abre la consola del navegador (F12) para ver los logs detallados<br/>
                2. Haz clic en "Actualizar" para recargar los usuarios<br/>
                3. Si acabas de registrar un usuario, puede tardar unos segundos en aparecer<br/>
                4. El trigger debería crear automáticamente el perfil para nuevos registros
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="text-sm text-gray-600 mb-4">
            Mostrando {filteredUsers.length} de {users.length} usuarios registrados
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Fecha de Registro</TableHead>
                    <TableHead>Pedidos</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>{user.orders?.length || 0} pedidos</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setViewDialogOpen(true);
                            }}
                          >
                            <Eye size={14} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => {
                              setUserToDelete(user);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {/* Diálogo para ver detalles de usuario */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalles del Usuario</DialogTitle>
            <DialogDescription>
              Información completa del usuario y sus pedidos
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <Tabs defaultValue="info">
              <TabsList>
                <TabsTrigger value="info">Información</TabsTrigger>
                <TabsTrigger value="orders">Pedidos ({selectedUser.orders?.length || 0})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-4 mt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Nombre</p>
                    <div className="flex items-center">
                      <UserRound size={16} className="mr-2 text-gray-400" />
                      <p>{selectedUser.name}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <div className="flex items-center">
                      <Mail size={16} className="mr-2 text-gray-400" />
                      <p>{selectedUser.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Teléfono</p>
                    <p>{selectedUser.phone || 'No especificado'}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Rol</p>
                    <Badge variant={selectedUser.role === 'Admin' ? 'default' : 'secondary'}>
                      {selectedUser.role}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Fecha de Registro</p>
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-2 text-gray-400" />
                      <p>{formatDate(selectedUser.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Tiempo como cliente</p>
                    <div className="flex items-center">
                      <Clock size={16} className="mr-2 text-gray-400" />
                      <p>{
                        (() => {
                          try {
                            const start = new Date(selectedUser.createdAt);
                            const now = new Date();
                            const diffTime = Math.abs(now.getTime() - start.getTime());
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            return `${diffDays} días`;
                          } catch {
                            return 'No disponible';
                          }
                        })()
                      }</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Dirección</p>
                  <p>{selectedUser.address || 'No especificada'}</p>
                </div>
              </TabsContent>
              
              <TabsContent value="orders" className="mt-4">
                {selectedUser.orders && selectedUser.orders.length > 0 ? (
                  <div className="space-y-4">
                    {selectedUser.orders.map(order => (
                      <Card key={order.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold">Pedido #{order.id}</h4>
                              <p className="text-sm text-gray-500">{formatDate(order.date)}</p>
                            </div>
                            <Badge variant={order.status === 'Completado' ? 'default' : 'secondary'}>
                              {order.status}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Artículos:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {order.items.map((item, idx) => (
                                <li key={idx}>
                                  {item.quantity}x {item.name} - ${item.price?.toFixed(2) || '0.00'}
                                </li>
                              ))}
                            </ul>
                            
                            <div className="border-t pt-2 mt-2 text-right">
                              <p className="font-semibold">Total: ${order.total.toFixed(2)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingBag size={36} className="mx-auto text-gray-400 mb-3" />
                    <p>Este usuario no ha realizado ningún pedido</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
          
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar usuario */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el usuario
              "{userToDelete?.name}" y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={handleDeleteUser}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManagement;
