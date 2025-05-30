
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { School, Package, Users, BarChart, LogOut, Settings } from 'lucide-react';
import SchoolManagement from '@/components/admin/SchoolManagement';
import PackManagement from '@/components/admin/PackManagement';
import UserManagement from '@/components/admin/UserManagement';
import Analytics from '@/components/admin/Analytics';
import AdminSettings from '@/components/admin/AdminSettings';

const AdminDashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const isAdmin = localStorage.getItem('adminAuth');
    if (!isAdmin) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {t('admin.dashboard')}
            </h1>
            <Button onClick={handleLogout} variant="outline">
              <LogOut size={16} className="mr-2" />
              {t('admin.logout')}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart size={16} />
              {t('admin.analytics')}
            </TabsTrigger>
            <TabsTrigger value="schools" className="flex items-center gap-2">
              <School size={16} />
              {t('admin.schools')}
            </TabsTrigger>
            <TabsTrigger value="packs" className="flex items-center gap-2">
              <Package size={16} />
              {t('admin.packs')}
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users size={16} />
              {t('admin.users')}
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings size={16} />
              {t('admin.settings')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <Analytics />
          </TabsContent>
          
          <TabsContent value="schools">
            <SchoolManagement />
          </TabsContent>
          
          <TabsContent value="packs">
            <PackManagement />
          </TabsContent>
          
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="settings">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
