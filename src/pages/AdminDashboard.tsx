import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/contexts/AdminContext';
import { LogOut, LayoutDashboard, School, Package, Users, Settings, Shield } from 'lucide-react';
import SchoolManagement from '@/components/admin/SchoolManagement';
import PackManagement from '@/components/admin/PackManagement';
import UserManagement from '@/components/admin/UserManagement';
import Analytics from '@/components/admin/Analytics';
import AdminSettings from '@/components/admin/AdminSettings';

const AdminDashboard = () => {
  const { isAdminAuthenticated, adminLogout } = useAdmin();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics');

  // Check authentication
  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAdminAuthenticated, navigate]);

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-purple-900 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Shield className="mr-2" size={24} />
            <h1 className="text-xl font-bold">Panel de Administración</h1>
          </div>
          <Button variant="outline" className="text-white border-white hover:bg-purple-800" onClick={handleLogout}>
            <LogOut size={16} className="mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto py-6 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-5 gap-2">
            <TabsTrigger value="analytics" className="flex items-center">
              <LayoutDashboard size={16} className="mr-2" />
              Analítica
            </TabsTrigger>
            <TabsTrigger value="schools" className="flex items-center">
              <School size={16} className="mr-2" />
              Escuelas
            </TabsTrigger>
            <TabsTrigger value="packs" className="flex items-center">
              <Package size={16} className="mr-2" />
              Packs de Útiles
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center">
              <Users size={16} className="mr-2" />
              Usuarios
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center">
              <Settings size={16} className="mr-2" />
              Configuración
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
