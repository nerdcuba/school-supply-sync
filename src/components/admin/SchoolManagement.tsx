
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { School, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Tipo para una escuela
interface SchoolType {
  id: string;
  name: string;
  address: string;
  phone: string;
  principal: string;
  website: string;
}

const SchoolManagement = () => {
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newSchool, setNewSchool] = useState<SchoolType>({
    id: '',
    name: '',
    address: '',
    phone: '',
    principal: '',
    website: ''
  });
  const [editingSchool, setEditingSchool] = useState<SchoolType | null>(null);
  const [deletingSchool, setDeletingSchool] = useState<SchoolType | null>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Cargar escuelas desde localStorage al inicio
  useEffect(() => {
    const savedSchools = localStorage.getItem('planAheadSchools');
    if (savedSchools) {
      setSchools(JSON.parse(savedSchools));
    }
  }, []);

  // Guardar escuelas en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem('planAheadSchools', JSON.stringify(schools));
  }, [schools]);

  // Filtrar escuelas según término de búsqueda
  const filteredSchools = schools.filter(school => 
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agregar nueva escuela
  const handleAddSchool = () => {
    // Validar duplicados
    if (schools.some(s => s.name.toLowerCase() === newSchool.name.toLowerCase())) {
      toast({
        title: "Error",
        description: "Ya existe una escuela con ese nombre",
        variant: "destructive"
      });
      return;
    }

    // Validación básica
    if (!newSchool.name || !newSchool.address || !newSchool.phone) {
      toast({
        title: "Error",
        description: "Por favor completa los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    const schoolToAdd = {
      ...newSchool,
      id: Date.now().toString()
    };
    
    setSchools([...schools, schoolToAdd]);
    setNewSchool({
      id: '',
      name: '',
      address: '',
      phone: '',
      principal: '',
      website: ''
    });
    setOpenAddDialog(false);
    
    toast({
      title: "Escuela añadida",
      description: "La escuela ha sido añadida con éxito"
    });
  };

  // Actualizar escuela existente
  const handleUpdateSchool = () => {
    if (!editingSchool) return;

    // Validar duplicados (excluyendo la escuela actual)
    if (schools.some(s => s.id !== editingSchool.id && s.name.toLowerCase() === editingSchool.name.toLowerCase())) {
      toast({
        title: "Error",
        description: "Ya existe otra escuela con ese nombre",
        variant: "destructive"
      });
      return;
    }

    // Validación básica
    if (!editingSchool.name || !editingSchool.address || !editingSchool.phone) {
      toast({
        title: "Error",
        description: "Por favor completa los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    const updatedSchools = schools.map(school => 
      school.id === editingSchool.id ? editingSchool : school
    );
    
    setSchools(updatedSchools);
    setEditingSchool(null);
    setOpenEditDialog(false);
    
    toast({
      title: "Escuela actualizada",
      description: "La información de la escuela ha sido actualizada"
    });
  };

  // Eliminar escuela
  const handleDeleteSchool = () => {
    if (!deletingSchool) return;
    
    const updatedSchools = schools.filter(school => school.id !== deletingSchool.id);
    setSchools(updatedSchools);
    setDeletingSchool(null);
    setOpenDeleteDialog(false);
    
    toast({
      title: "Escuela eliminada",
      description: "La escuela ha sido eliminada con éxito"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Gestión de Escuelas</h2>
        <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Añadir Escuela
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Añadir Nueva Escuela</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre de la Escuela*</Label>
                <Input 
                  id="name" 
                  value={newSchool.name} 
                  onChange={(e) => setNewSchool({...newSchool, name: e.target.value})}
                  placeholder="Ej. Escuela Primaria Roosevelt"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Dirección*</Label>
                <Input 
                  id="address" 
                  value={newSchool.address} 
                  onChange={(e) => setNewSchool({...newSchool, address: e.target.value})}
                  placeholder="Dirección completa"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Teléfono*</Label>
                <Input 
                  id="phone" 
                  value={newSchool.phone} 
                  onChange={(e) => setNewSchool({...newSchool, phone: e.target.value})}
                  placeholder="Ej. (305) 123-4567"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="principal">Director/a</Label>
                <Input 
                  id="principal" 
                  value={newSchool.principal} 
                  onChange={(e) => setNewSchool({...newSchool, principal: e.target.value})}
                  placeholder="Nombre del director/a"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="website">Sitio Web</Label>
                <Input 
                  id="website" 
                  value={newSchool.website} 
                  onChange={(e) => setNewSchool({...newSchool, website: e.target.value})}
                  placeholder="Ej. https://escuela.edu"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenAddDialog(false)}>Cancelar</Button>
              <Button onClick={handleAddSchool}>Guardar Escuela</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          className="pl-10"
          placeholder="Buscar escuelas por nombre o dirección..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Listado de escuelas */}
      {schools.length === 0 ? (
        <Card className="text-center p-10">
          <CardContent className="pt-10">
            <School className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold">No hay escuelas registradas</h3>
            <p className="mt-2 text-sm text-gray-500">
              Añade tu primera escuela usando el botón "Añadir Escuela"
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
                  <TableHead>Dirección</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Director/a</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchools.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell className="font-medium">{school.name}</TableCell>
                    <TableCell>{school.address}</TableCell>
                    <TableCell>{school.phone}</TableCell>
                    <TableCell>{school.principal}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingSchool(school);
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
                            setDeletingSchool(school);
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Escuela</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nombre de la Escuela*</Label>
              <Input 
                id="edit-name" 
                value={editingSchool?.name || ''} 
                onChange={(e) => setEditingSchool(prev => prev ? {...prev, name: e.target.value} : null)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-address">Dirección*</Label>
              <Input 
                id="edit-address" 
                value={editingSchool?.address || ''} 
                onChange={(e) => setEditingSchool(prev => prev ? {...prev, address: e.target.value} : null)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Teléfono*</Label>
              <Input 
                id="edit-phone" 
                value={editingSchool?.phone || ''} 
                onChange={(e) => setEditingSchool(prev => prev ? {...prev, phone: e.target.value} : null)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-principal">Director/a</Label>
              <Input 
                id="edit-principal" 
                value={editingSchool?.principal || ''} 
                onChange={(e) => setEditingSchool(prev => prev ? {...prev, principal: e.target.value} : null)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-website">Sitio Web</Label>
              <Input 
                id="edit-website" 
                value={editingSchool?.website || ''} 
                onChange={(e) => setEditingSchool(prev => prev ? {...prev, website: e.target.value} : null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
            <Button onClick={handleUpdateSchool}>Actualizar Escuela</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la escuela
              "{deletingSchool?.name}" y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={handleDeleteSchool}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SchoolManagement;
