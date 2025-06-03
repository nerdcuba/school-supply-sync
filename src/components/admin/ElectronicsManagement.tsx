
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Star, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { electronicsService, ElectronicFrontend } from '@/services/electronicsService';

const ElectronicsManagement = () => {
  const [electronics, setElectronics] = useState<ElectronicFrontend[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingElectronic, setEditingElectronic] = useState<ElectronicFrontend | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    price: '',
    originalPrice: '',
    description: '',
    image: '',
    features: '',
    rating: '',
    reviews: '',
    inStock: true
  });

  const categories = ['Laptops', 'Tablets', 'Audífonos', 'Grabadores', 'Calculadoras', 'Accesorios'];

  useEffect(() => {
    fetchElectronics();
  }, []);

  const fetchElectronics = async () => {
    try {
      const { data, error } = await electronicsService.getElectronics();
      if (error) throw error;
      setElectronics(data);
    } catch (error) {
      console.error('Error fetching electronics:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos electrónicos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      brand: '',
      price: '',
      originalPrice: '',
      description: '',
      image: '',
      features: '',
      rating: '',
      reviews: '',
      inStock: true
    });
    setEditingElectronic(null);
  };

  const handleEdit = (electronic: ElectronicFrontend) => {
    setEditingElectronic(electronic);
    setFormData({
      name: electronic.name,
      category: electronic.category,
      brand: electronic.brand,
      price: electronic.price.toString(),
      originalPrice: electronic.original_price?.toString() || '',
      description: electronic.description || '',
      image: electronic.image || '',
      features: electronic.features.join(', '),
      rating: electronic.rating.toString(),
      reviews: electronic.reviews.toString(),
      inStock: electronic.in_stock
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const featuresArray = formData.features
        .split(',')
        .map(f => f.trim())
        .filter(f => f.length > 0);

      const electronicData = {
        name: formData.name,
        category: formData.category,
        brand: formData.brand,
        price: parseFloat(formData.price),
        original_price: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        description: formData.description || null,
        image: formData.image || null,
        features: featuresArray,
        rating: parseFloat(formData.rating),
        reviews: parseInt(formData.reviews),
        in_stock: formData.inStock
      };

      let error;
      if (editingElectronic) {
        ({ error } = await supabase
          .from('electronics')
          .update(electronicData)
          .eq('id', editingElectronic.id));
      } else {
        ({ error } = await supabase
          .from('electronics')
          .insert([electronicData]));
      }

      if (error) throw error;

      toast({
        title: "Éxito",
        description: editingElectronic 
          ? "Producto electrónico actualizado exitosamente"
          : "Producto electrónico creado exitosamente",
      });

      fetchElectronics();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving electronic:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el producto electrónico",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto electrónico?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('electronics')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Producto electrónico eliminado exitosamente",
      });

      fetchElectronics();
    } catch (error) {
      console.error('Error deleting electronic:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto electrónico",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando productos electrónicos...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <Package className="mr-2" size={24} />
                Gestión de Productos Electrónicos
              </CardTitle>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                  <Plus size={16} className="mr-2" />
                  Agregar Producto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingElectronic ? 'Editar' : 'Agregar'} Producto Electrónico
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nombre del Producto *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="brand">Marca *</Label>
                      <Input
                        id="brand"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Categoría *</Label>
                      <select
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Seleccionar categoría</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="price">Precio *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="originalPrice">Precio Original</Label>
                      <Input
                        id="originalPrice"
                        type="number"
                        step="0.01"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="image">URL de Imagen</Label>
                      <Input
                        id="image"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="features">Características (separadas por comas)</Label>
                    <Textarea
                      id="features"
                      value={formData.features}
                      onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                      placeholder="Ej: 8GB RAM, Intel Core i5, 256GB SSD"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="rating">Calificación</Label>
                      <Input
                        id="rating"
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="reviews">Número de Reseñas</Label>
                      <Input
                        id="reviews"
                        type="number"
                        min="0"
                        value={formData.reviews}
                        onChange={(e) => setFormData({ ...formData, reviews: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center space-x-2 mt-6">
                      <input
                        type="checkbox"
                        id="inStock"
                        checked={formData.inStock}
                        onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                      />
                      <Label htmlFor="inStock">En Stock</Label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingElectronic ? 'Actualizar' : 'Crear'} Producto
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Calificación</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {electronics.map((electronic) => (
                  <TableRow key={electronic.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {electronic.image && (
                          <img
                            src={electronic.image}
                            alt={electronic.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <div className="font-medium">{electronic.name}</div>
                          <div className="text-sm text-gray-500">{electronic.description}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{electronic.category}</Badge>
                    </TableCell>
                    <TableCell>{electronic.brand}</TableCell>
                    <TableCell>
                      <div>
                        <span className="font-bold">${electronic.price}</span>
                        {electronic.original_price && electronic.original_price > electronic.price && (
                          <div className="text-sm text-gray-500 line-through">
                            ${electronic.original_price}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{electronic.rating}</span>
                        <span className="text-gray-500">({electronic.reviews})</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={electronic.in_stock ? "default" : "destructive"}>
                        {electronic.in_stock ? "En Stock" : "Agotado"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(electronic)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(electronic.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {electronics.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No hay productos electrónicos registrados
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ElectronicsManagement;
