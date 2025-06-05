
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import { SupplyItem } from '@/services/adminSupplyPackService';

interface PackItemsEditorProps {
  items: SupplyItem[];
  onItemsChange: (items: SupplyItem[]) => void;
}

const categories = [
  'Arte',
  'Escritura', 
  'Papel',
  'Oficina',
  'Organización',
  'Matemáticas',
  'Referencia',
  'General'
];

const PackItemsEditor = ({ items, onItemsChange }: PackItemsEditorProps) => {
  const [newItem, setNewItem] = useState<Omit<SupplyItem, 'id'>>({
    name: '',
    quantity: 1,
    category: 'General'
  });

  const handleAddItem = () => {
    if (!newItem.name.trim()) return;
    
    const item: SupplyItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...newItem
    };
    
    onItemsChange([...items, item]);
    setNewItem({ name: '', quantity: 1, category: 'General' });
  };

  const handleRemoveItem = (itemId: string) => {
    onItemsChange(items.filter(item => item.id !== itemId));
  };

  const handleItemChange = (itemId: string, field: keyof SupplyItem, value: string | number) => {
    onItemsChange(items.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    ));
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4">
        <h4 className="font-semibold mb-3">Artículos del Paquete</h4>
        
        {/* Add new item form */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div>
            <Label htmlFor="item-name">Nombre del Artículo</Label>
            <Input
              id="item-name"
              value={newItem.name}
              onChange={(e) => setNewItem({...newItem, name: e.target.value})}
              placeholder="Ej. Lápices #2"
            />
          </div>
          <div>
            <Label htmlFor="item-quantity">Cantidad</Label>
            <Input
              id="item-quantity"
              type="number"
              min="1"
              value={newItem.quantity}
              onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 1})}
            />
          </div>
          <div>
            <Label htmlFor="item-category">Categoría</Label>
            <Select 
              value={newItem.category} 
              onValueChange={(value) => setNewItem({...newItem, category: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleAddItem} className="w-full">
              <Plus size={16} className="mr-2" />
              Añadir
            </Button>
          </div>
        </div>

        {/* Items table */}
        {items.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artículo</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="w-20">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Input
                        value={item.name}
                        onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                        className="border-none p-0 h-auto"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        className="border-none p-0 h-auto w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={item.category || 'General'} 
                        onValueChange={(value) => handleItemChange(item.id, 'category', value)}
                      >
                        <SelectTrigger className="border-none p-0 h-auto">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500 border rounded-lg bg-gray-50">
            <p>No hay artículos en este paquete.</p>
            <p className="text-sm">Añade artículos usando el formulario de arriba.</p>
          </div>
        )}
        
        <div className="mt-2 text-sm text-gray-600">
          Total de artículos: {items.length}
        </div>
      </div>
    </div>
  );
};

export default PackItemsEditor;
