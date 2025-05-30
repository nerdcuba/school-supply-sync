
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { Eye, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  registrationDate: string;
  totalPurchases: number;
  totalSpent: number;
  lastLogin: string;
}

const UserManagement = () => {
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'María García',
      email: 'maria@email.com',
      registrationDate: '2024-01-15',
      totalPurchases: 3,
      totalSpent: 245.97,
      lastLogin: '2024-01-28'
    },
    {
      id: '2',
      name: 'Carlos López',
      email: 'carlos@email.com',
      registrationDate: '2024-01-20',
      totalPurchases: 1,
      totalSpent: 89.99,
      lastLogin: '2024-01-27'
    },
    {
      id: '3',
      name: 'Ana Martínez',
      email: 'ana@email.com',
      registrationDate: '2024-01-22',
      totalPurchases: 2,
      totalSpent: 156.48,
      lastLogin: '2024-01-29'
    }
  ]);
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };

  const handleDelete = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
    toast({
      title: t('admin.userDeleted'),
      description: t('admin.userDeletedDesc'),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('admin.userManagement')}</CardTitle>
        <CardDescription>{t('admin.userManagementDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('auth.name')}</TableHead>
              <TableHead>{t('auth.email')}</TableHead>
              <TableHead>{t('admin.registrationDate')}</TableHead>
              <TableHead>{t('admin.totalPurchases')}</TableHead>
              <TableHead>{t('admin.totalSpent')}</TableHead>
              <TableHead>{t('admin.lastLogin')}</TableHead>
              <TableHead>{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{new Date(user.registrationDate).toLocaleDateString()}</TableCell>
                <TableCell>{user.totalPurchases}</TableCell>
                <TableCell>${user.totalSpent.toFixed(2)}</TableCell>
                <TableCell>{new Date(user.lastLogin).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(user)}
                    >
                      <Eye size={14} />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(user.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('admin.userDetails')}</DialogTitle>
              <DialogDescription>
                {t('admin.userDetailsDesc')}
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>{t('auth.name')}:</strong>
                    <p>{selectedUser.name}</p>
                  </div>
                  <div>
                    <strong>{t('auth.email')}:</strong>
                    <p>{selectedUser.email}</p>
                  </div>
                  <div>
                    <strong>{t('admin.registrationDate')}:</strong>
                    <p>{new Date(selectedUser.registrationDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <strong>{t('admin.lastLogin')}:</strong>
                    <p>{new Date(selectedUser.lastLogin).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <strong>{t('admin.totalPurchases')}:</strong>
                    <p>{selectedUser.totalPurchases}</p>
                  </div>
                  <div>
                    <strong>{t('admin.totalSpent')}:</strong>
                    <p>${selectedUser.totalSpent.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default UserManagement;
