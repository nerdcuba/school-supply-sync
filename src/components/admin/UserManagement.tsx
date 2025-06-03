
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
      }, () => {
        loadUsers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadUsers = async () => {
    try {
      console.log('Cargando usuarios...');
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

      console.log('Usuarios cargados:', data);
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
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user role:', error);
        toast({
          title: "Error",
          description: "No se pudo actualizar el rol del usuario",
          variant: "destructive"
        });
        return;
      }

      console.log('Rol actualizado exitosamente');
      toast({
        title: "Rol actualizado",
        description: `El rol del usuario ha sido actualizado a ${newRole}`
      });

      await loadUsers();
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
      
      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          phone: data.phone,
          address: data.address,
          role: data.role,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingUser.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Error",
          description: "No se pudo actualizar el perfil del usuario",
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
      await loadUsers();
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
      console.log(`Iniciando eliminación del usuario: ${userId} (${userName})`);
      
      // Eliminar órdenes asociadas primero
      console.log('Eliminando órdenes del usuario...');
      const { error: ordersError } = await supabase
        .from('orders')
        .delete()
        .eq('user_id', userId);

      if (ordersError) {
        console.warn('Error eliminando órdenes:', ordersError);
        // Continuar aunque falle la eliminación de órdenes
      } else {
        console.log('Órdenes eliminadas correctamente');
      }

      // Eliminar el perfil del usuario
      console.log('Eliminando perfil del usuario...');
      const { data: deletedProfile, error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)
        .select();

      if (profileError) {
        console.error('Error deleting profile:', profileError);
        toast({
          title: "Error",
          description: `Error al eliminar el perfil: ${profileError.message}`,
          variant: "destructive"
        });
        return;
      }

      if (!deletedProfile || deletedProfile.length === 0) {
        console.error('No se eliminó ningún perfil');
        toast({
          title: "Error", 
          description: "No se encontró el usuario para eliminar",
          variant: "destructive"
        });
        return;
      }

      console.log('Perfil eliminado:', deletedProfile);

      // Intentar eliminar el usuario de auth también
      console.log('Intentando eliminar usuario de auth...');
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authError) {
        console.warn('Error eliminando usuario de auth (esto puede ser normal):', authError);
        // No mostramos error al usuario porque el perfil ya fue eliminado
      } else {
        console.log('Usuario eliminado de auth correctamente');
      }

      toast({
        title: "Usuario eliminado",
        description: `El usuario ${userName} ha sido eliminado correctamente`
      });

      // Recargar la lista inmediatamente
      await loadUsers();
      
    } catch (error) {
      console.error('Error eliminando usuario:', error);
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
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_blocked: !isBlocked,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Error blocking/unblocking user:', error);
        toast({
          title: "Error",
          description: "No se pudo cambiar el estado del usuario",
          variant: "destructive"
        });
        return;
      }

      console.log(`Usuario ${isBlocked ? 'desbloqueado' : 'bloqueado'} exitosamente`);
      toast({
        title: isBlocked ? "Usuario desbloqueado" : "Usuario bloqueado",
        description: `El usuario ${userName} ha sido ${isBlocked ? 'desbloqueado' : 'bloqueado'} correctamente`
      });

      await loadUsers();
    } catch (error) {
      console.error('Error blocking/unblocking user:', error);
      toast({
        title: "Error",
        description: "Error inesperado al cambiar el estado del usuario",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUsers = users.length;
  const adminUsers = users.filter(u => u.role === 'admin').length;
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
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          className="pl-10"
          placeholder="Buscar usuarios por email o nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

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
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
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
                            <Button variant="destructive" size="sm" className="p-2">
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
                        {user.role !== 'admin' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateUserRole(user.id, 'admin')}
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
                        <option value="admin">Administrador</option>
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
