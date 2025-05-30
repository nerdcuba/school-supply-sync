
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface School {
  id: string;
  name: string;
  location: string;
  contactEmail: string;
  contactPhone: string;
}

const SchoolManagement = () => {
  const { t } = useLanguage();
  const [schools, setSchools] = useState<School[]>([
    {
      id: '1',
      name: 'Colegio San José',
      location: 'Calle Principal 123, Ciudad',
      contactEmail: 'info@colegiosanjose.edu',
      contactPhone: '+1 234 567 8900'
    },
    {
      id: '2',
      name: 'Escuela María Montessori',
      location: 'Av. Libertad 456, Ciudad',
      contactEmail: 'contacto@montessori.edu',
      contactPhone: '+1 234 567 8901'
    }
  ]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    contactEmail: '',
    contactPhone: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSchool) {
      // Update existing school
      setSchools(prev => prev.map(school => 
        school.id === editingSchool.id 
          ? { ...school, ...formData }
          : school
      ));
      toast({
        title: t('admin.schoolUpdated'),
        description: t('admin.schoolUpdatedDesc'),
      });
    } else {
      // Add new school
      const newSchool: School = {
        id: Date.now().toString(),
        ...formData
      };
      setSchools(prev => [...prev, newSchool]);
      toast({
        title: t('admin.schoolAdded'),
        description: t('admin.schoolAddedDesc'),
      });
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      contactEmail: '',
      contactPhone: ''
    });
    setEditingSchool(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (school: School) => {
    setEditingSchool(school);
    setFormData({
      name: school.name,
      location: school.location,
      contactEmail: school.contactEmail,
      contactPhone: school.contactPhone
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (schoolId: string) => {
    setSchools(prev => prev.filter(school => school.id !== schoolId));
    toast({
      title: t('admin.schoolDeleted'),
      description: t('admin.schoolDeletedDesc'),
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{t('admin.schoolManagement')}</CardTitle>
            <CardDescription>{t('admin.schoolManagementDesc')}</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus size={16} className="mr-2" />
                {t('admin.addSchool')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingSchool ? t('admin.editSchool') : t('admin.addSchool')}
                </DialogTitle>
                <DialogDescription>
                  {editingSchool ? t('admin.editSchoolDesc') : t('admin.addSchoolDesc')}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">{t('admin.schoolName')}</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="location">{t('admin.location')}</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactEmail">{t('admin.contactEmail')}</Label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactPhone">{t('admin.contactPhone')}</Label>
                  <Input
                    id="contactPhone"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">
                    {editingSchool ? t('common.update') : t('common.add')}
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
              <TableHead>{t('admin.schoolName')}</TableHead>
              <TableHead>{t('admin.location')}</TableHead>
              <TableHead>{t('admin.contactEmail')}</TableHead>
              <TableHead>{t('admin.contactPhone')}</TableHead>
              <TableHead>{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schools.map((school) => (
              <TableRow key={school.id}>
                <TableCell className="font-medium">{school.name}</TableCell>
                <TableCell>{school.location}</TableCell>
                <TableCell>{school.contactEmail}</TableCell>
                <TableCell>{school.contactPhone}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(school)}
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(school.id)}
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

export default SchoolManagement;
