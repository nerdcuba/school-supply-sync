
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { PackageOpen, Plus, Pencil, Trash2, Search, DollarSign, PlusCircle, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { schoolService, School } from '@/services/schoolService';
import { adminSupplyPackService, AdminSupplyPack, SupplyItem } from '@/services/adminSupplyPackService';

const PackManagement = () => {
  const [packs, setPacks] = useState<AdminSupplyPack[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingSchools, setLoadingSchools] = useState(true);

  const [newPack, setNewPack] = useState<Omit<AdminSupplyPack, 'id'>>({
    name: '',
    schoolId: '',
    schoolName: '',
    grade: '',
    price: 0,
    items: []
  });

  const [newItem, setNewItem] = useState<SupplyItem>({
    id: '',
    name: '',
    quantity: 1
  });

  const [editingPack, setEditingPack] = useState<AdminSupplyPack | null>(null);
  const [deletingPack, setDeletingPack] = useState<AdminSupplyPack | null>(null);
  const [editingItem, setEditingItem] = useState<SupplyItem | null>(null);
  const [deletingItemIndex, setDeletingItemIndex] = useState<number | null>(null);

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openAddItemDialog, setOpenAddItemDialog] = useState(false);
  const [openEditItemDialog, setOpenEditItemDialog] = useState(false);
  const [openDeleteItemDialog, setOpenDeleteItemDialog] = useState(false);

  const grades = [
    "Preescolar", "Kindergarten", 
    "1er Grado", "2do Grado", "3er Grado", "4to Grado", "5to Grado", 
    "6to Grado", "7mo Grado", "8vo Grado", 
    "9no Grado", "10mo Grado", "11vo Grado", "12vo Grado"
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar packs desde Supabase
        const packsData = await adminSupplyPackService.getAll();
        setPacks(packsData);

        // Cargar escuelas desde Supabase
        const schoolsData = await schoolService.getAll();
        setSchools(schoolsData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
        setLoadingSchools(false);
      }
    };

    loadData();
  }, []);

  const filteredPacks = packs.filter(pack => 
    pack.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pack.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pack.grade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPack = async () => {
    console.log('Attempting to add pack:', newPack);
    
    // Validación
    if (!newPack.name || !newPack.schoolId || !newPack.grade || newPack.price < 0) {
      console.log('Validation failed:', { name: newPack.name, schoolId: newPack.schoolId, grade: newPack.grade, price: newPack.price });
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios y asegúrate de que el precio sea válido",
        variant: "destructive"
      });
      return;
    }

    try {
      // Encontrar el nombre de la escuela
      const selectedSchool = schools.find(s => s.id === newPack.schoolId);
      console.log('Selected school:', selectedSchool);
      
      const packToAdd = {
        ...newPack,
        schoolName: selectedSchool?.name || 'Escuela Desconocida',
      };
      
      console.log('Pack to add:', packToAdd);
      
      const createdPack = await adminSupplyPackService.create(packToAdd);
      console.log('Pack created successfully:', createdPack);
      
      setPacks([createdPack, ...packs]);
      
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
        title: "Pack añadido",
        description: "El pack ha sido añadido con éxito"
      });
    } catch (error) {
      console.error('Error adding pack:', error);
      toast({
        title: "Error",
        description: "No se pudo añadir el pack. Revisa la consola para más detalles.",
        variant: "destructive"
      });
    }
  };

  const handleUpdatePack = async () => {
    if (!editingPack) return;

    // Validación
    if (!editingPack.name || !editingPack.schoolId || !editingPack.grade || editingPack.price < 0) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios y asegúrate de que el precio sea válido",
        variant: "destructive"
      });
      return;
    }

    try {
      // Encontrar el nombre de la escuela actualizada
      const selectedSchool = schools.find(s => s.id === editingPack.schoolId);
      const updatedPackData = {
        ...editingPack,
        schoolName: selectedSchool?.name || 'Escuela Desconocida',
      };

      const updatedPack = await adminSupplyPackService.update(editingPack.id, updatedPackData);
      
      const updatedPacks = packs.map(pack => 
        pack.id === editingPack.id ? updatedPack : pack
      );
      
      setPacks(updatedPacks);
      setEditingPack(null);
      setOpenEditDialog(false);
      
      toast({
        title: "Pack actualizado",
        description: "La información del pack ha sido actualizada"
      });
    } catch (error) {
      console.error('Error updating pack:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el pack",
        variant: "destructive"
      });
    }
  };

  const handleDeletePack = async () => {
    if (!deletingPack) return;
    
    try {
      await adminSupplyPackService.delete(deletingPack.id);
      
      const updatedPacks = packs.filter(pack => pack.id !== deletingPack.id);
      setPacks(updatedPacks);
      setDeletingPack(null);
      setOpenDeleteDialog(false);
      
      toast({
        title: "Pack eliminado",
        description: "El pack ha sido eliminado con éxito"
      });
    } catch (error) {
      console.error('Error deleting pack:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el pack",
        variant: "destructive"
      });
    }
  };

  const handleAddItem = () => {
    // Validación
    if (!newItem.name || newItem.quantity <= 0) {
      toast({
        title: "Error",
        description: "Por favor ingresa un nombre y cantidad válidos",
        variant: "destructive"
      });
      return;
    }

    const itemToAdd = {
      ...newItem,
      id: Date.now().toString()
    };

    // Añadir al pack nuevo
    if (!editingPack) {
      setNewPack({
        ...newPack,
        items: [...newPack.items, itemToAdd]
      });
    } 
    // Añadir al pack en edición
    else {
      setEditingPack({
        ...editingPack,
        items: [...editingPack.items, itemToAdd]
      });
    }

    setNewItem({
      id: '',
      name: '',
      quantity: 1
    });
    setOpenAddItemDialog(false);
    
    toast({
      title: "Artículo añadido",
      description: "El artículo ha sido añadido al pack"
    });
  };

  const handleUpdateItem = () => {
    if (!editingItem || !editingPack) return;

    // Validación
    if (!editingItem.name || editingItem.quantity <= 0) {
      toast({
        title: "Error",
        description: "Por favor ingresa un nombre y cantidad válidos",
        variant: "destructive"
      });
      return;
    }

    const updatedItems = editingPack.items.map(item => 
      item.id === editingItem.id ? editingItem : item
    );

    setEditingPack({
      ...editingPack,
      items: updatedItems
    });

    setEditingItem(null);
    setOpenEditItemDialog(false);
    
    toast({
      title: "Artículo actualizado",
      description: "El artículo ha sido actualizado"
    });
  };

  const handleDeleteItem = () => {
    if (deletingItemIndex === null || !editingPack) return;
    
    const updatedItems = [...editingPack.items];
    updatedItems.splice(deletingItemIndex, 1);

    setEditingPack({
      ...editingPack,
      items: updatedItems
    });

    setDeletingItemIndex(null);
    setOpenDeleteItemDialog(false);
    
    toast({
      title: "Artículo eliminado",
      description: "El artículo ha sido eliminado del pack"
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Cargando packs de útiles...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Gestión de Packs de Útiles</h2>
        <Button onClick={() => setOpenAddDialog(true)}>
          <Plus size={16} className="mr-2" />
          Añadir Pack
        </Button>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          className="pl-10"
          placeholder="Buscar por nombre de pack, escuela o grado..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Listado de packs */}
      {packs.length === 0 ? (
        <Card className="text-center p-10">
          <CardContent className="pt-10">
            <PackageOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold">No hay packs registrados</h3>
            <p className="mt-2 text-sm text-gray-500">
              Añade tu primer pack de útiles usando el botón "Añadir Pack"
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre del Pack</TableHead>
                  <TableHead>Escuela</TableHead>
                  <TableHead>Grado</TableHead>
                  <TableHead>Artículos</TableHead>
                  <TableHead>Precio del Pack</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPacks.map((pack) => (
                  <TableRow key={pack.id}>
                    <TableCell className="font-medium">{pack.name}</TableCell>
                    <TableCell>{pack.schoolName}</TableCell>
                    <TableCell>{pack.grade}</TableCell>
                    <TableCell>{pack.items.length} artículos</TableCell>
                    <TableCell>${pack.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingPack(pack);
                            setOpenEditDialog(true);
                          }}
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

      {/* Diálogo para añadir pack */}
      <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Añadir Nuevo Pack de Útiles</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre del Pack*</Label>
              <Input 
                id="name" 
                value={newPack.name} 
                onChange={(e) => setNewPack({...newPack, name: e.target.value})}
                placeholder="Ej. Pack Completo Primer Grado"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="school">Escuela*</Label>
              <Select 
                value={newPack.schoolId} 
                onValueChange={(value) => setNewPack({...newPack, schoolId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una escuela" />
                </SelectTrigger>
                <SelectContent>
                  {loadingSchools ? (
                    <SelectItem value="loading" disabled>
                      Cargando escuelas...
                    </SelectItem>
                  ) : schools.length === 0 ? (
                    <SelectItem value="no-schools" disabled>
                      No hay escuelas disponibles
                    </SelectItem>
                  ) : (
                    schools.map((school) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="grade">Grado*</Label>
              <Select 
                value={newPack.grade} 
                onValueChange={(value) => setNewPack({...newPack, grade: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un grado" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="pack-price">Precio del Pack ($)*</Label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <Input 
                  id="pack-price"
                  type="number"
                  min="0"
                  step="0.01"
                  className="pl-8"
                  value={newPack.price}
                  onChange={(e) => setNewPack({...newPack, price: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label>Artículos ({newPack.items.length})</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setOpenAddItemDialog(true)}
                >
                  <PlusCircle size={14} className="mr-1" />
                  Añadir Artículo
                </Button>
              </div>

              {newPack.items.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Artículo</TableHead>
                        <TableHead>Cantidad</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {newPack.items.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4 border rounded-md">
                  No hay artículos añadidos
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenAddDialog(false)}>Cancelar</Button>
            <Button onClick={handleAddPack}>Guardar Pack</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar pack */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Pack de Útiles</DialogTitle>
          </DialogHeader>
          {editingPack && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nombre del Pack*</Label>
                <Input 
                  id="edit-name" 
                  value={editingPack.name} 
                  onChange={(e) => setEditingPack({...editingPack, name: e.target.value})}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-school">Escuela*</Label>
                <Select 
                  value={editingPack.schoolId} 
                  onValueChange={(value) => setEditingPack({...editingPack, schoolId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una escuela" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map((school) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-grade">Grado*</Label>
                <Select 
                  value={editingPack.grade} 
                  onValueChange={(value) => setEditingPack({...editingPack, grade: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un grado" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-pack-price">Precio del Pack ($)*</Label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <Input 
                    id="edit-pack-price"
                    type="number"
                    min="0"
                    step="0.01"
                    className="pl-8"
                    value={editingPack.price}
                    onChange={(e) => setEditingPack({...editingPack, price: parseFloat(e.target.value) || 0})}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <div className="flex justify-between items-center">
                  <Label>Artículos ({editingPack.items.length})</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setOpenAddItemDialog(true)}
                  >
                    <PlusCircle size={14} className="mr-1" />
                    Añadir Artículo
                  </Button>
                </div>

                {editingPack.items.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Artículo</TableHead>
                          <TableHead>Cantidad</TableHead>
                          <TableHead className="w-[80px]">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {editingPack.items.map((item, index) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    setEditingItem(item);
                                    setOpenEditItemDialog(true);
                                  }}
                                >
                                  <Pencil size={14} />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-500"
                                  onClick={() => {
                                    setDeletingItemIndex(index);
                                    setOpenDeleteItemDialog(true);
                                  }}
                                >
                                  <X size={14} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4 border rounded-md">
                    No hay artículos añadidos
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
            <Button onClick={handleUpdatePack}>Actualizar Pack</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el pack
              "{deletingPack?.name}" y todos sus artículos.
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

      <Dialog open={openAddItemDialog} onOpenChange={setOpenAddItemDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Añadir Artículo</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="item-name">Nombre del Artículo*</Label>
              <Input 
                id="item-name" 
                value={newItem.name} 
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                placeholder="Ej. Cuaderno espiral"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="item-quantity">Cantidad*</Label>
              <Input 
                id="item-quantity"
                type="number"
                min="1"
                value={newItem.quantity}
                onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenAddItemDialog(false)}>Cancelar</Button>
            <Button onClick={handleAddItem}>Añadir Artículo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openEditItemDialog} onOpenChange={setOpenEditItemDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Artículo</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-item-name">Nombre del Artículo*</Label>
                <Input 
                  id="edit-item-name" 
                  value={editingItem.name} 
                  onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-item-quantity">Cantidad*</Label>
                <Input 
                  id="edit-item-quantity"
                  type="number"
                  min="1"
                  value={editingItem.quantity}
                  onChange={(e) => setEditingItem({...editingItem, quantity: parseInt(e.target.value) || 0})}
                  required
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditItemDialog(false)}>Cancelar</Button>
            <Button onClick={handleUpdateItem}>Actualizar Artículo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={openDeleteItemDialog} onOpenChange={setOpenDeleteItemDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este artículo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el artículo del pack. Puedes añadir nuevos artículos después.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={handleDeleteItem}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PackManagement;
