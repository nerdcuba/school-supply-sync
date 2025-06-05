import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { Package, Plus, Pencil, Trash2, Search, Upload } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminSupplyPackService, AdminSupplyPack, SupplyItem } from '@/services/adminSupplyPackService';
import { schoolService, School } from '@/services/schoolService';
import { supabase } from '@/integrations/supabase/client';
import PackItemsEditor from './PackItemsEditor';
import CSVUploadDialog from './CSVUploadDialog';

const PackManagement = () => {
  const [packs, setPacks] = useState<AdminSupplyPack[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newPack, setNewPack] = useState<Omit<AdminSupplyPack, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    schoolId: '',
    schoolName: '',
    grade: '',
    price: 0,
    items: []
  });
  const [editingPack, setEditingPack] = useState<AdminSupplyPack | null>(null);
  const [deletingPack, setDeletingPack] = useState<AdminSupplyPack | null>(null);
  const [csvUploadPack, setCsvUploadPack] = useState<AdminSupplyPack | null>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openCSVDialog, setOpenCSVDialog] = useState(false);

  // Cargar paquetes y escuelas desde Supabase
  useEffect(() => {
    loadPacks();
    loadSchools();

    // Configurar actualización en tiempo real
    const channel = supabase
      .channel('admin_supply_packs-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'admin_supply_packs'
      }, () => {
        loadPacks();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadPacks = async () => {
    try {
      const data = await adminSupplyPackService.getAll();
      setPacks(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los paquetes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSchools = async () => {
    try {
      const data = await schoolService.getAllForAdmin();
      setSchools(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las escuelas",
        variant: "destructive"
      });
    }
  };

  // Filtrar paquetes según término de búsqueda
  const filteredPacks = packs.filter(pack => 
    pack.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pack.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pack.grade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agregar nuevo paquete
  const handleAddPack = async () => {
    // Validación básica
    if (!newPack.name || !newPack.schoolId || !newPack.grade || !newPack.price) {
      toast({
        title: "Error",
        description: "Por favor completa los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    if (newPack.items.length === 0) {
      toast({
        title: "Error",
        description: "Por favor añade al menos un artículo al paquete",
        variant: "destructive"
      });
      return;
    }

    try {
      await adminSupplyPackService.create(newPack);
      setNewPack({
        name: '',
        schoolId: '',
        schoolName: '',
        grade: '',
        price: 0,
        items: []
      });
      setOpenAddDialog(false);
      
      toast({
        title: "Paquete añadido",
        description: `El paquete ha sido añadido con éxito con ${newPack.items.length} artículos`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo añadir el paquete",
        variant: "destructive"
      });
    }
  };

  // Actualizar paquete existente
  const handleUpdatePack = async () => {
    if (!editingPack) return;

    console.log('Actualizando paquete:', editingPack);
    console.log('Items a guardar:', editingPack.items);

    // Validación básica
    if (!editingPack.name || !editingPack.schoolId || !editingPack.grade || !editingPack.price) {
      toast({
        title: "Error",
        description: "Por favor completa los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    if (editingPack.items.length === 0) {
      toast({
        title: "Error",
        description: "Por favor añade al menos un artículo al paquete",
        variant: "destructive"
      });
      return;
    }

    try {
      // Crear el objeto de actualización con todos los campos necesarios
      const updateData = {
        name: editingPack.name,
        schoolId: editingPack.schoolId,
        schoolName: editingPack.schoolName,
        grade: editingPack.grade,
        price: editingPack.price,
        items: editingPack.items
      };

      console.log('Datos de actualización:', updateData);

      await adminSupplyPackService.update(editingPack.id, updateData);
      
      // Recargar los paquetes para reflejar los cambios
      await loadPacks();
      
      setEditingPack(null);
      setOpenEditDialog(false);
      
      toast({
        title: "Paquete actualizado",
        description: `La información del paquete ha sido actualizada con ${editingPack.items.length} artículos`
      });
    } catch (error) {
      console.error('Error al actualizar paquete:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el paquete",
        variant: "destructive"
      });
    }
  };

  // Eliminar paquete
  const handleDeletePack = async () => {
    if (!deletingPack) return;
    
    try {
      await adminSupplyPackService.delete(deletingPack.id);
      setDeletingPack(null);
      setOpenDeleteDialog(false);
      
      toast({
        title: "Paquete eliminado",
        description: "El paquete ha sido eliminado con éxito"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el paquete",
        variant: "destructive"
      });
    }
  };

  // Manejar carga de CSV
  const handleCSVUpload = async (items: SupplyItem[]) => {
    if (!csvUploadPack) return;

    try {
      const updatedPack = {
        ...csvUploadPack,
        items: [...csvUploadPack.items, ...items]
      };
      
      await adminSupplyPackService.update(csvUploadPack.id, updatedPack);
      setCsvUploadPack(null);
      
      toast({
        title: "Artículos añadidos",
        description: `Se añadieron ${items.length} artículos al paquete desde el CSV`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron añadir los artículos del CSV",
        variant: "destructive"
      });
    }
  };

  // Función para iniciar la edición de un paquete
  const startEditingPack = (pack: AdminSupplyPack) => {
    console.log('Editando paquete:', pack);
    console.log('Items del paquete:', pack.items);
    
    // Crear una copia profunda del paquete para editarlo
    const packToEdit = {
      ...pack,
      items: Array.isArray(pack.items) ? [...pack.items] : []
    };
    
    setEditingPack(packToEdit);
    setOpenEditDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Cargando paquetes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Gestión de Paquetes de Útiles</h2>
        <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Añadir Paquete
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Añadir Nuevo Paquete</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre del Paquete*</Label>
                  <Input 
                    id="name" 
                    value={newPack.name} 
                    onChange={(e) => setNewPack({...newPack, name: e.target.value})}
                    placeholder="Ej. Paquete Primaria 2024"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="grade">Grado*</Label>
                  <Input 
                    id="grade" 
                    value={newPack.grade} 
                    onChange={(e) => setNewPack({...newPack, grade: e.target.value})}
                    placeholder="Ej. 1er grado"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="school">Escuela*</Label>
                  <Select onValueChange={(value) => {
                    const selectedSchool = schools.find(school => school.id === value);
                    setNewPack({...newPack, schoolId: value, schoolName: selectedSchool?.name || ''});
                  }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona una escuela" />
                    </SelectTrigger>
                    <SelectContent>
                      {schools.map((school) => (
                        <SelectItem key={school.id} value={school.id}>{school.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price">Precio*</Label>
                  <Input 
                    id="price" 
                    type="number"
                    step="0.01"
                    value={newPack.price.toString()} 
                    onChange={(e) => setNewPack({...newPack, price: parseFloat(e.target.value) || 0})}
                    placeholder="Ej. 25.00"
                    required
                  />
                </div>
              </div>
              
              <PackItemsEditor 
                items={newPack.items}
                onItemsChange={(items) => setNewPack({...newPack, items})}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenAddDialog(false)}>Cancelar</Button>
              <Button onClick={handleAddPack}>Guardar Paquete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Barra de búsqueda mejorada */}
      <div className="flex items-center space-x-2 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            className="pl-10 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Buscar paquetes por nombre, escuela o grado..."
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
          Mostrando {filteredPacks.length} de {packs.length} paquetes
          {searchTerm && ` para "${searchTerm}"`}
        </div>
      )}

      {/* Listado de paquetes */}
      {packs.length === 0 ? (
        <Card className="text-center p-10">
          <CardContent className="pt-10">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold">No hay paquetes registrados</h3>
            <p className="mt-2 text-sm text-gray-500">
              Añade tu primer paquete usando el botón "Añadir Paquete"
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Escuela</TableHead>
                  <TableHead>Grado</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPacks.map((pack) => (
                  <TableRow key={pack.id}>
                    <TableCell className="font-medium">{pack.name}</TableCell>
                    <TableCell>{pack.schoolName}</TableCell>
                    <TableCell>{pack.grade}</TableCell>
                    <TableCell>${pack.price.toFixed(2)}</TableCell>
                    <TableCell>{pack.items.length} items</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCsvUploadPack(pack);
                            setOpenCSVDialog(true);
                          }}
                          title="Subir CSV de artículos"
                        >
                          <Upload size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEditingPack(pack)}
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => {
                            setDeletingPack(pack);
                            setOpenDeleteDialog(true);
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
      )}

      {/* Diálogo de edición */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Paquete</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nombre del Paquete*</Label>
                <Input 
                  id="edit-name" 
                  value={editingPack?.name || ''} 
                  onChange={(e) => setEditingPack(prev => prev ? {...prev, name: e.target.value} : null)}
                  placeholder="Ej. Paquete Primaria 2024"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-grade">Grado*</Label>
                <Input 
                  id="edit-grade" 
                  value={editingPack?.grade || ''} 
                  onChange={(e) => setEditingPack(prev => prev ? {...prev, grade: e.target.value} : null)}
                  placeholder="Ej. 1er grado"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-school">Escuela*</Label>
                <Select 
                  value={editingPack?.schoolId || ''}
                  onValueChange={(value) => {
                    const selectedSchool = schools.find(school => school.id === value);
                    setEditingPack(prev => prev ? {...prev, schoolId: value, schoolName: selectedSchool?.name || ''} : null);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona una escuela" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map((school) => (
                      <SelectItem key={school.id} value={school.id}>{school.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Precio*</Label>
                <Input 
                  id="edit-price" 
                  type="number"
                  step="0.01"
                  value={editingPack?.price?.toString() || ''} 
                  onChange={(e) => setEditingPack(prev => prev ? {...prev, price: parseFloat(e.target.value) || 0} : null)}
                  placeholder="Ej. 25.00"
                  required
                />
              </div>
            </div>
            
            {editingPack && (
              <PackItemsEditor 
                items={editingPack.items || []}
                onItemsChange={(items) => {
                  console.log('Items actualizados en editor:', items);
                  setEditingPack({...editingPack, items});
                }}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
            <Button onClick={handleUpdatePack}>Actualizar Paquete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el paquete
              "{deletingPack?.name}" y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={handleDeletePack}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de carga CSV */}
      <CSVUploadDialog
        open={openCSVDialog}
        onOpenChange={setOpenCSVDialog}
        onItemsUploaded={handleCSVUpload}
        packName={csvUploadPack?.name || ''}
      />
    </div>
  );
};

export default PackManagement;
