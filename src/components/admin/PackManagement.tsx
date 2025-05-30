
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Pack {
  id: string;
  name: string;
  schoolId: string;
  grade: string;
  price: number;
  description: string;
  items: string[];
}

const PackManagement = () => {
  const { t } = useLanguage();
  const [packs, setPacks] = useState<Pack[]>([
    {
      id: '1',
      name: 'Pack Primaria Básico',
      schoolId: '1',
      grade: 'Primaria',
      price: 45.99,
      description: 'Kit básico para estudiantes de primaria',
      items: ['Cuadernos (5)', 'Lápices (10)', 'Borradores (3)', 'Regla', 'Tijeras']
    },
    {
      id: '2',
      name: 'Pack Secundaria Completo',
      schoolId: '1',
      grade: 'Secundaria',
      price: 89.99,
      description: 'Kit completo para estudiantes de secundaria',
      items: ['Cuadernos (8)', 'Bolígrafos (15)', 'Calculadora', 'Compás', 'Transportador']
    }
  ]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPack, setEditingPack] = useState<Pack | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    schoolId: '',
    grade: '',
    price: '',
    description: '',
    items: ''
  });

  const schools = [
    { id: '1', name: 'Colegio San José' },
    { id: '2', name: 'Escuela María Montessori' }
  ];

  const grades = ['Preescolar', 'Primaria', 'Secundaria', 'Bachillerato'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const packData = {
      ...formData,
      price: parseFloat(formData.price),
      items: formData.items.split('\n').filter(item => item.trim() !== '')
    };

    if (editingPack) {
      // Update existing pack
      setPacks(prev => prev.map(pack => 
        pack.id === editingPack.id 
          ? { ...pack, ...packData }
          : pack
      ));
      toast({
        title: t('admin.packUpdated'),
        description: t('admin.packUpdatedDesc'),
      });
    } else {
      // Add new pack
      const newPack: Pack = {
        id: Date.now().toString(),
        ...packData
      };
      setPacks(prev => [...prev, newPack]);
      toast({
        title: t('admin.packAdded'),
        description: t('admin.packAddedDesc'),
      });
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      schoolId: '',
      grade: '',
      price: '',
      description: '',
      items: ''
    });
    setEditingPack(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (pack: Pack) => {
    setEditingPack(pack);
    setFormData({
      name: pack.name,
      schoolId: pack.schoolId,
      grade: pack.grade,
      price: pack.price.toString(),
      description: pack.description,
      items: pack.items.join('\n')
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (packId: string) => {
    setPacks(prev => prev.filter(pack => pack.id !== packId));
    toast({
      title: t('admin.packDeleted'),
      description: t('admin.packDeletedDesc'),
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const getSchoolName = (schoolId: string) => {
    return schools.find(school => school.id === schoolId)?.name || 'N/A';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{t('admin.packManagement')}</CardTitle>
            <CardDescription>{t('admin.packManagementDesc')}</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus size={16} className="mr-2" />
                {t('admin.addPack')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingPack ? t('admin.editPack') : t('admin.addPack')}
                </DialogTitle>
                <DialogDescription>
                  {editingPack ? t('admin.editPackDesc') : t('admin.addPackDesc')}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">{t('admin.packName')}</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">{t('admin.price')}</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="schoolId">{t('admin.school')}</Label>
                    <Select value={formData.schoolId} onValueChange={(value) => setFormData(prev => ({ ...prev, schoolId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('admin.selectSchool')} />
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
                  <div>
                    <Label htmlFor="grade">{t('admin.grade')}</Label>
                    <Select value={formData.grade} onValueChange={(value) => setFormData(prev => ({ ...prev, grade: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('admin.selectGrade')} />
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
                </div>
                
                <div>
                  <Label htmlFor="description">{t('admin.description')}</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="items">{t('admin.items')} ({t('admin.onePerLine')})</Label>
                  <Textarea
                    id="items"
                    name="items"
                    value={formData.items}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Cuadernos (5)&#10;Lápices (10)&#10;Borradores (3)"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit">
                    {editingPack ? t('common.update') : t('common.add')}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    {t('common.cancel')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.packName')}</TableHead>
              <TableHead>{t('admin.school')}</TableHead>
              <TableHead>{t('admin.grade')}</TableHead>
              <TableHead>{t('admin.price')}</TableHead>
              <TableHead>{t('admin.items')}</TableHead>
              <TableHead>{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packs.map((pack) => (
              <TableRow key={pack.id}>
                <TableCell className="font-medium">{pack.name}</TableCell>
                <TableCell>{getSchoolName(pack.schoolId)}</TableCell>
                <TableCell>{pack.grade}</TableCell>
                <TableCell>${pack.price.toFixed(2)}</TableCell>
                <TableCell>
                  <div className="max-w-xs">
                    {pack.items.slice(0, 3).join(', ')}
                    {pack.items.length > 3 && '...'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(pack)}
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(pack.id)}
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
  );
};

export default PackManagement;
