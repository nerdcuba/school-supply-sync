import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { toast } from '@/hooks/use-toast';
import { School, Plus, Pencil, Trash2, Search, Power, PowerOff, Users, BookOpen, Upload } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { schoolService, School as SchoolType } from '@/services/schoolService';
import { supabase } from '@/integrations/supabase/client';

const SchoolManagement = () => {
  // ... keep existing code (state variables and useEffect)
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newSchool, setNewSchool] = useState<Omit<SchoolType, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    address: '',
    phone: '',
    grades: '',
    enrollment: 0,
    is_active: true
  });
  const [editingSchool, setEditingSchool] = useState<SchoolType | null>(null);
  const [deletingSchool, setDeletingSchool] = useState<SchoolType | null>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // New pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [schoolsPerPage, setSchoolsPerPage] = useState(10);

  // ... keep existing code (useEffect, loadSchools function)
  useEffect(() => {
    loadSchools();
    
    // Configurar actualización en tiempo real
    const channel = supabase
      .channel('schools-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'schools'
      }, () => {
        loadSchools();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  // Filtrar escuelas según término de búsqueda
  const filteredSchools = schools.filter(school => 
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.grades.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredSchools.length / schoolsPerPage);
  const startIndex = (currentPage - 1) * schoolsPerPage;
  const endIndex = startIndex + schoolsPerPage;
  const paginatedSchools = filteredSchools.slice(startIndex, endIndex);

  // Reset pagination when search term or schools per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, schoolsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSchoolsPerPageChange = (value: string) => {
    setSchoolsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  // ... keep existing code (parseCSVLine, handleCsvUpload, handleAddSchool, handleUpdateSchool, handleDeleteSchool, handleToggleActive functions)
  const parseCSVLine = (line: string): string[] => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  };

  const handleCsvUpload = async () => {
    if (!csvFile) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo CSV",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    try {
      const text = await csvFile.text();
      const rows = text.split('\n').filter(row => row.trim() !== '');
      
      if (rows.length < 2) {
        toast({
          title: "Error en formato CSV",
          description: "El archivo debe tener al menos una fila de encabezados y una fila de datos",
          variant: "destructive"
        });
        return;
      }

      const headers = parseCSVLine(rows[0]).map(h => h.toLowerCase().replace(/['"]/g, '').trim());
      
      const requiredHeaders = ['name', 'address', 'phone', 'grades', 'enrollment'];
      const headerMapping: { [key: string]: string } = {};
      
      requiredHeaders.forEach(required => {
        const found = headers.find(h => 
          h === required || 
          h.includes(required) || 
          (required === 'enrollment' && (h.includes('matricula') || h.includes('estudiantes')))
        );
        if (found) {
          headerMapping[required] = found;
        }
      });
      
      const missingHeaders = requiredHeaders.filter(h => !headerMapping[h]);
      
      if (missingHeaders.length > 0) {
        toast({
          title: "Error en formato CSV",
          description: `Faltan las columnas: ${missingHeaders.join(', ')}. Headers encontrados: ${headers.join(', ')}`,
          variant: "destructive"
        });
        return;
      }

      const schoolsToAdd = [];
      const errors = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i].trim();
        if (!row) continue;

        try {
          const values = parseCSVLine(row);
          
          if (values.length !== headers.length) {
            errors.push(`Fila ${i + 1}: Número incorrecto de columnas (esperadas: ${headers.length}, encontradas: ${values.length})`);
            continue;
          }

          const schoolData: any = {};
          headers.forEach((header, index) => {
            schoolData[header] = values[index].replace(/['"]/g, '').trim();
          });

          const name = schoolData[headerMapping['name']];
          const address = schoolData[headerMapping['address']];
          const phone = schoolData[headerMapping['phone']];
          const grades = schoolData[headerMapping['grades']];
          const enrollmentValue = schoolData[headerMapping['enrollment']];

          if (!name || !address || !phone || !grades) {
            errors.push(`Fila ${i + 1}: Campos obligatorios faltantes (nombre: ${name}, dirección: ${address}, teléfono: ${phone}, grados: ${grades})`);
            continue;
          }

          const enrollment = parseInt(enrollmentValue.replace(/[^\d]/g, ''));
          if (isNaN(enrollment) || enrollment <= 0) {
            errors.push(`Fila ${i + 1}: Matrícula debe ser un número positivo (valor: ${enrollmentValue})`);
            continue;
          }

          const existingSchool = schools.find(s => 
            s.name.toLowerCase() === name.toLowerCase()
          );
          if (existingSchool) {
            errors.push(`Fila ${i + 1}: La escuela "${name}" ya existe`);
            continue;
          }

          schoolsToAdd.push({
            name: name,
            address: address,
            phone: phone,
            grades: grades,
            enrollment: enrollment,
            is_active: true
          });

        } catch (parseError) {
          errors.push(`Fila ${i + 1}: Error al procesar la fila - ${parseError}`);
          continue;
        }
      }

      if (errors.length > 0) {
        console.log('Errores encontrados:', errors);
        toast({
          title: "Algunos errores encontrados",
          description: `${errors.length} filas con errores. ${schoolsToAdd.length} escuelas válidas para agregar.`,
          variant: "destructive"
        });
        
        if (schoolsToAdd.length === 0) {
          return;
        }
      }

      if (schoolsToAdd.length === 0) {
        toast({
          title: "Sin datos",
          description: "No se encontraron escuelas válidas para agregar",
          variant: "destructive"
        });
        return;
      }

      let successCount = 0;
      let failCount = 0;

      for (const school of schoolsToAdd) {
        try {
          await schoolService.create(school);
          successCount++;
        } catch (error) {
          failCount++;
          console.error(`Error al crear escuela ${school.name}:`, error);
        }
      }

      toast({
        title: "Proceso completado",
        description: `${successCount} escuelas agregadas exitosamente${failCount > 0 ? `, ${failCount} fallaron` : ''}`
      });

      setCsvFile(null);
      setOpenUploadDialog(false);
      
    } catch (error) {
      console.error('Error al procesar CSV:', error);
      toast({
        title: "Error",
        description: "Error al procesar el archivo CSV",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleAddSchool = async () => {
    if (schools.some(s => s.name.toLowerCase() === newSchool.name.toLowerCase())) {
      toast({
        title: "Error",
        description: "Ya existe una escuela con ese nombre",
        variant: "destructive"
      });
      return;
    }

    if (!newSchool.name || !newSchool.address || !newSchool.phone || !newSchool.grades || newSchool.enrollment <= 0) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    try {
      await schoolService.create(newSchool);
      setNewSchool({
        name: '',
        address: '',
        phone: '',
        grades: '',
        enrollment: 0,
        is_active: true
      });
      setOpenAddDialog(false);
      
      toast({
        title: "Escuela añadida",
        description: "La escuela ha sido añadida con éxito"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo añadir la escuela",
        variant: "destructive"
      });
    }
  };

  const handleUpdateSchool = async () => {
    if (!editingSchool) return;

    if (schools.some(s => s.id !== editingSchool.id && s.name.toLowerCase() === editingSchool.name.toLowerCase())) {
      toast({
        title: "Error",
        description: "Ya existe otra escuela con ese nombre",
        variant: "destructive"
      });
      return;
    }

    if (!editingSchool.name || !editingSchool.address || !editingSchool.phone || !editingSchool.grades || editingSchool.enrollment <= 0) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    try {
      await schoolService.update(editingSchool.id, editingSchool);
      setEditingSchool(null);
      setOpenEditDialog(false);
      
      toast({
        title: "Escuela actualizada",
        description: "La información de la escuela ha sido actualizada"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la escuela",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSchool = async () => {
    if (!deletingSchool) return;
    
    try {
      await schoolService.delete(deletingSchool.id);
      setDeletingSchool(null);
      setOpenDeleteDialog(false);
      
      toast({
        title: "Escuela eliminada",
        description: "La escuela ha sido eliminada con éxito"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la escuela",
        variant: "destructive"
      });
    }
  };

  const handleToggleActive = async (school: SchoolType) => {
    try {
      await schoolService.toggleActive(school.id, !school.is_active);
      
      toast({
        title: school.is_active ? "Escuela deshabilitada" : "Escuela habilitada",
        description: school.is_active 
          ? "La escuela ya no será visible en el frontend" 
          : "La escuela ahora es visible en el frontend"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado de la escuela",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Cargando escuelas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Gestión de Escuelas</h2>
        <div className="flex space-x-2">
          {/* ... keep existing code (CSV upload and add school dialogs) */}
          <Dialog open={openUploadDialog} onOpenChange={setOpenUploadDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload size={16} className="mr-2" />
                Subir CSV
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Subir Escuelas desde CSV</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="csv-file">Archivo CSV</Label>
                  <Input 
                    id="csv-file" 
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-sm text-gray-500">
                    El archivo debe contener las columnas: Name, Address, Phone, Grades, Enrollment
                  </p>
                  <p className="text-xs text-gray-400">
                    Formato soportado: CSV con comillas y comas dentro de campos
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenUploadDialog(false)}>Cancelar</Button>
                <Button onClick={handleCsvUpload} disabled={uploading || !csvFile}>
                  {uploading ? 'Procesando...' : 'Subir Escuelas'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
                  <Label htmlFor="name">Escuela*</Label>
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
                  <Label htmlFor="grades">Grados*</Label>
                  <Input 
                    id="grades" 
                    value={newSchool.grades} 
                    onChange={(e) => setNewSchool({...newSchool, grades: e.target.value})}
                    placeholder="Ej. K-5, 6-8, 9-12"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="enrollment">Matrícula*</Label>
                  <Input 
                    id="enrollment" 
                    type="number"
                    min="1"
                    value={newSchool.enrollment || ''} 
                    onChange={(e) => setNewSchool({...newSchool, enrollment: parseInt(e.target.value) || 0})}
                    placeholder="Número de estudiantes"
                    required
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
      </div>

      {/* Search bar and pagination controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            className="pl-10 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Buscar escuelas por nombre, dirección o grados..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="schools-per-page" className="text-sm whitespace-nowrap">Mostrar:</Label>
            <Select value={schoolsPerPage.toString()} onValueChange={handleSchoolsPerPageChange}>
              <SelectTrigger className="w-20 h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-600 whitespace-nowrap">por página</span>
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
      </div>

      {/* Results summary */}
      {searchTerm && (
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          Mostrando {filteredSchools.length} de {schools.length} escuelas
          {searchTerm && ` para "${searchTerm}"`}
        </div>
      )}

      {/* Schools listing */}
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
                  <TableHead>Estado</TableHead>
                  <TableHead>Escuela</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Grados</TableHead>
                  <TableHead>Matrícula</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSchools.map((school) => (
                  <TableRow key={school.id} className={!school.is_active ? 'opacity-50' : ''}>
                    <TableCell>
                      <div className="flex items-center">
                        {school.is_active ? (
                          <div className="flex items-center text-green-600">
                            <Power size={16} className="mr-1" />
                            <span className="text-sm font-medium">Activa</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600">
                            <PowerOff size={16} className="mr-1" />
                            <span className="text-sm font-medium">Inactiva</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{school.name}</TableCell>
                    <TableCell>{school.address}</TableCell>
                    <TableCell>{school.phone}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <BookOpen size={14} className="mr-1 text-gray-400" />
                        {school.grades}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users size={14} className="mr-1 text-gray-400" />
                        {school.enrollment.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(school)}
                          className={school.is_active ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                          title={school.is_active ? 'Deshabilitar escuela' : 'Habilitar escuela'}
                        >
                          {school.is_active ? <PowerOff size={14} /> : <Power size={14} />}
                        </Button>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 px-2">
          <div className="text-sm text-gray-600">
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredSchools.length)} de {filteredSchools.length} escuelas
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

      {/* ... keep existing code (edit dialog, delete dialog) */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Escuela</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Escuela*</Label>
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
              <Label htmlFor="edit-grades">Grados*</Label>
              <Input 
                id="edit-grades" 
                value={editingSchool?.grades || ''} 
                onChange={(e) => setEditingSchool(prev => prev ? {...prev, grades: e.target.value} : null)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-enrollment">Matrícula*</Label>
              <Input 
                id="edit-enrollment" 
                type="number"
                min="1"
                value={editingSchool?.enrollment || ''} 
                onChange={(e) => setEditingSchool(prev => prev ? {...prev, enrollment: parseInt(e.target.value) || 0} : null)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
            <Button onClick={handleUpdateSchool}>Actualizar Escuela</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
