
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';

const AdminSettings = () => {
  const { t } = useLanguage();
  const [credentials, setCredentials] = useState({
    currentPassword: '',
    newUsername: 'admin',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (credentials.newPassword !== credentials.confirmPassword) {
      toast({
        title: t('messages.error'),
        description: t('auth.passwordsDontMatch'),
        variant: "destructive",
      });
      return;
    }

    // In a real app, you would validate the current password and update the credentials
    toast({
      title: t('admin.credentialsUpdated'),
      description: t('admin.credentialsUpdatedDesc'),
    });
    
    setCredentials({
      currentPassword: '',
      newUsername: 'admin',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.adminCredentials')}</CardTitle>
          <CardDescription>{t('admin.adminCredentialsDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div>
              <Label htmlFor="currentPassword">{t('admin.currentPassword')}</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={credentials.currentPassword}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="newUsername">{t('admin.newUsername')}</Label>
              <Input
                id="newUsername"
                name="newUsername"
                value={credentials.newUsername}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="newPassword">{t('admin.newPassword')}</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={credentials.newPassword}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
            
            <div>
              <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={credentials.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
            
            <Button type="submit">
              {t('admin.updateCredentials')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('admin.systemInfo')}</CardTitle>
          <CardDescription>{t('admin.systemInfoDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>{t('admin.version')}:</strong> 1.0.0</p>
            <p><strong>{t('admin.lastUpdate')}:</strong> {new Date().toLocaleDateString()}</p>
            <p><strong>{t('admin.totalSchools')}:</strong> 2</p>
            <p><strong>{t('admin.totalPacks')}:</strong> 2</p>
            <p><strong>{t('admin.totalUsers')}:</strong> 3</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
