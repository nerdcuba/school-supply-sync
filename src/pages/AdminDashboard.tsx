
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useSecureAdmin } from '@/contexts/SecureAdminContext';
import { LogOut, LayoutDashboard, School, Package, Users, Settings, Shield, Laptop, ShoppingCart, Image } from 'lucide-react';
import SchoolManagement from '@/components/admin/SchoolManagement';
import PackManagement from '@/components/admin/PackManagement';
import UserManagement from '@/components/admin/UserManagement';
import Analytics from '@/components/admin/Analytics';
import AdminSettings from '@/components/admin/AdminSettings';
import ElectronicsManagement from '@/components/admin/ElectronicsManagement';
import OrderManagement from '@/components/admin/OrderManagement';
import SliderManagement from '@/components/admin/SliderManagement';
import { Toaster } from '@/components/ui/toaster';

const AdminDashboard = () => {
  const { isAdminAuthenticated, adminLogout, loading } = useSecureAdmin();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics');

  // Check authentication and redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAdminAuthenticated) {
      console.log('🚫 Usuario no autenticado como admin, redirigiendo...');
      navigate('/admin/login');
    }
  }, [isAdminAuthenticated, navigate, loading]);

  const handleLogout = async () => {
    await adminLogout();
    navigate('/admin/login');
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-900"></div>
      </div>
    );
  }

  // If not authenticated, don't render the dashboard content
  // (the useEffect will handle the redirect)
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg">Redirigiendo al login de administrador...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-purple-900 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Shield className="mr-2 text-white" size={24} />
            <h1 className="text-xl font-bold text-white">Panel de Administración</h1>
          </div>
          <Button 
            variant="ghost" 
            className="text-white hover:bg-white hover:text-purple-900 transition-colors duration-200" 
            onClick={handleLogout}
          >
            <LogOut size={16} className="mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto py-6 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-8 gap-2">
            <TabsTrigger value="analytics" className="flex items-center">
              <LayoutDashboard size={16} className="mr-2" />
              Analítica
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center">
              <ShoppingCart size={16} className="mr-2" />
              Órdenes
            </TabsTrigger>
            <TabsTrigger value="slider" className="flex items-center">
              <Image size={16} className="mr-2" />
              Slider
            </TabsTrigger>
            <TabsTrigger value="schools" className="flex items-center">
              <School size={16} className="mr-2" />
              Escuelas
            </TabsTrigger>
            <TabsTrigger value="packs" className="flex items-center">
              <Package size={16} className="mr-2" />
              Packs de Útiles
            </TabsTrigger>
            <TabsTrigger value="electronics" className="flex items-center">
              <Laptop size={16} className="mr-2" />
              Electrónicos
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
          
          <TabsContent value="orders">
            <OrderManagement />
          </TabsContent>
          
          <TabsContent value="slider">
            <SliderManagement />
          </TabsContent>
          
          <TabsContent value="schools">
            <SchoolManagement />
          </TabsContent>
          
          <TabsContent value="packs">
            <PackManagement />
          </TabsContent>
          
          <TabsContent value="electronics">
            <ElectronicsManagement />
          </TabsContent>
          
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="settings">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </div>
      
      <Toaster />
    </div>
  );
};

export default AdminDashboard;
