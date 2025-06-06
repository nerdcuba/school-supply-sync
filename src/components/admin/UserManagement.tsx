import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Search, Users, UserCheck, UserX, Edit, Trash2, Ban, Shield, ShieldOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  address?: string;
  phone?: string;
  is_blocked?: boolean;
}

interface EditUserForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const form = useForm<EditUserForm>();

  useEffect(() => {
    loadUsers();
    
    // Configurar realtime para usuarios
    const channel = supabase
      .channel('profiles-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles'
      }, (payload) => {
        console.log('Realtime event detected:', payload.eventType, payload);
        
        if (payload.eventType === 'DELETE') {
          const deletedUserId = payload.old?.id;
          if (deletedUserId) {
            console.log(`Removiendo usuario ${deletedUserId} por evento realtime DELETE`);
            setUsers(prevUsers => prevUsers.filter(user => user.id !== deletedUserId));
          }
        } else if (payload.eventType === 'INSERT') {
          const newUser = payload.new as UserProfile;
          if (newUser) {
            console.log('Agregando nuevo usuario:', newUser);
            setUsers(prevUsers => {
              if (prevUsers.find(u => u.id === newUser.id)) {
                return prevUsers;
              }
              return [newUser, ...prevUsers];
            });
          }
        } else if (payload.eventType === 'UPDATE') {
          const updatedUser = payload.new as UserProfile;
          if (updatedUser) {
            console.log('Actualizando usuario:', updatedUser);
            setUsers(prevUsers => 
              prevUsers.map(user => 
                user.id === updatedUser.id ? updatedUser : user
              )
            );
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadUsers = async () => {
    try {
      console.log('Cargando usuarios desde la base de datos...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading users:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios",
          variant: "destructive"
        });
        return;
      }

      console.log(`Usuarios cargados desde DB: ${data?.length || 0} usuarios`);
      console.log('Lista de usuarios desde DB:', data?.map(u => ({ id: u.id, name: u.name, email: u.email })));
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Error inesperado al cargar usuarios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      console.log(`Actualizando rol del usuario ${userId} a ${newRole}`);
      
      const { data, error } = await supabase.rpc('update_user_role', {
        user_id_to_update: userId,
        new_role: newRole
      });

      if (error) {
        console.error('Error updating user role:', error);
        toast({
          title: "Error",
          description: `No se pudo actualizar el rol del usuario: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      if (!data) {
        console.error('La función retornó false - usuario no encontrado');
        toast({
          title: "Error",
          description: "El usuario no fue encontrado en la base de datos",
          variant: "destructive"
        });
        return;
      }

      console.log('Rol actualizado exitosamente');
      toast({
        title: "Rol actualizado",
        description: `El rol del usuario ha sido actualizado a ${newRole}`
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Error inesperado al actualizar el rol",
        variant: "destructive"
      });
    }
  };

  const handleEditUser = (user: UserProfile) => {
    console.log('Editando usuario:', user);
    setEditingUser(user);
    form.reset({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      role: user.role || 'Cliente'
    });
    setEditDialogOpen(true);
  };

  const onSubmitEdit = async (data: EditUserForm) => {
    if (!editingUser) return;

    try {
      console.log('Actualizando usuario:', editingUser.id, data);
      
      const { data: result, error } = await supabase.rpc('update_user_profile', {
        user_id_to_update: editingUser.id,
        user_name: data.name,
        user_phone: data.phone,
        user_address: data.address,
        user_role: data.role
      });

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Error",
          description: `No se pudo actualizar el perfil del usuario: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      if (!result) {
        console.error('La función retornó false - usuario no encontrado');
        toast({
          title: "Error",
          description: "El usuario no fue encontrado en la base de datos",
          variant: "destructive"
        });
        return;
      }

      console.log('Usuario actualizado exitosamente');
      toast({
        title: "Usuario actualizado",
        description: "Los datos del usuario han sido actualizados correctamente"
      });

      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Error inesperado al actualizar el usuario",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    try {
      console.log(`=== INICIANDO ELIMINACIÓN DE USUARIO ===`);
      console.log(`Usuario ID: ${userId}`);
      console.log(`Usuario Nombre: ${userName}`);
      
      // Usar la función de base de datos que puede bypasear RLS
      console.log('=== ELIMINANDO USUARIO CON FUNCIÓN RPC ===');
      const { data, error } = await supabase.rpc('delete_user_profile', {
        user_id_to_delete: userId
      });

      if (error) {
        console.error('❌ Error eliminando usuario:', error);
        toast({
          title: "Error",
          description: `No se pudo eliminar el usuario: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      if (!data) {
        console.error('❌ La función retornó false - usuario no encontrado');
        toast({
          title: "Error",
          description: "El usuario no fue encontrado en la base de datos",
          variant: "destructive"
        });
        return;
      }
      
      console.log('✓ Usuario eliminado exitosamente');

      // Actualizar la lista local inmediatamente
      setUsers(prevUsers => {
        const newUsers = prevUsers.filter(user => user.id !== userId);
        console.log(`Usuarios restantes en lista local: ${newUsers.length}`);
        return newUsers;
      });

      toast({
        title: "Usuario eliminado",
        description: `El usuario ${userName} ha sido eliminado correctamente del sistema`,
      });
      
    } catch (error) {
      console.error('❌ Error inesperado eliminando usuario:', error);
      toast({
        title: "Error",
        description: "Error inesperado al eliminar el usuario",
        variant: "destructive"
      });
    }
  };

  const handleBlockUser = async (userId: string, isBlocked: boolean, userName: string) => {
    try {
      console.log(`${isBlocked ? 'Desbloqueando' : 'Bloqueando'} usuario: ${userId} (${userName})`);
      
      const { data, error } = await supabase.rpc('update_user_block_status', {
        user_id_to_update: userId,
        is_blocked: !isBlocked
      });

      if (error) {
        console.error('Error blocking/unblocking user:', error);
        toast({
          title: "Error",
          description: `No se pudo cambiar el estado del usuario: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      if (!data) {
        console.error('La función retornó false - usuario no encontrado');
        toast({
          title: "Error",
          description: "El usuario no fue encontrado en la base de datos",
          variant: "destructive"
        });
        return;
      }

      console.log(`Usuario ${isBlocked ? 'desbloqueado' : 'bloqueado'} exitosamente`);
      toast({
        title: isBlocked ? "Usuario desbloqueado" : "Usuario bloqueado",
        description: `El usuario ${userName} ha sido ${isBlocked ? 'desbloqueado' : 'bloqueado'} correctamente`
      });
    } catch (error) {
      console.error('Error blocking/unblocking user:', error);
      toast({
        title: "Error",
        description: "Error inesperado al cambiar el estado del usuario",
        variant: "destructive"
      });
    }
  };

  // Filtrar usuarios basado en la búsqueda mejorada
  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUsers = users.length;
  const adminUsers = users.filter(u => u.role === 'Admin').length;
  const clientUsers = users.filter(u => u.role === 'Cliente').length;
  const blockedUsers = users.filter(u => u.is_blocked).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Cargando usuarios...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Gestión de Usuarios</h2>
        <Badge variant="secondary">{totalUsers} usuarios registrados</Badge>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Usuarios registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminUsers}</div>
            <p className="text-xs text-muted-foreground">Con privilegios admin</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientUsers}</div>
            <p className="text-xs text-muted-foreground">Usuarios clientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Bloqueados</CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blockedUsers}</div>
            <p className="text-xs text-muted-foreground">Usuarios bloqueados</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            className="pl-10 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Buscar usuarios por email, nombre, rol o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchTerm('')}
            className="text-gray-500 hover:text-gray-700"
          >
            Limpiar
          </Button>
        )}
      </div>

      {/* Mostrar resultados de búsqueda */}
      {searchTerm && (
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          Mostrando {filteredUsers.length} de {totalUsers} usuarios
          {searchTerm && ` para "${searchTerm}"`}
        </div>
      )}

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No se encontraron usuarios</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha de Registro</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.name || 'Sin nombre'}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>
                        {user.role || 'Cliente'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_blocked ? 'destructive' : 'default'}>
                        {user.is_blocked ? 'Bloqueado' : 'Activo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        {/* 1. Botón Editar */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          className="p-2"
                        >
                          <Edit size={16} />
                        </Button>

                        {/* 2. Botón Bloquear/Desbloquear */}
                        <Button
                          variant={user.is_blocked ? "default" : "destructive"}
                          size="sm"
                          onClick={() => handleBlockUser(user.id, user.is_blocked || false, user.name || user.email)}
                          className="p-2"
                        >
                          {user.is_blocked ? <ShieldOff size={16} /> : <Ban size={16} />}
                        </Button>

                        {/* 3. Botón Eliminar con confirmación */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="p-2"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Esto eliminará permanentemente el usuario 
                                <strong> {user.name || user.email}</strong> y todos sus datos asociados.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.id, user.name || user.email)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Eliminar Usuario
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        {/* 4. Botón Cambiar Rol Admin */}
                        {user.role !== 'Admin' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateUserRole(user.id, 'Admin')}
                            className="p-2"
                          >
                            <Shield size={16} />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateUserRole(user.id, 'Cliente')}
                            className="p-2"
                          >
                            <UserX size={16} />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog para editar usuario */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nombre del usuario" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="email@ejemplo.com" disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Número de teléfono" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Dirección del usuario" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol</FormLabel>
                    <FormControl>
                      <select {...field} className="w-full p-2 border rounded-md">
                        <option value="Cliente">Cliente</option>
                        <option value="Admin">Administrador</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
