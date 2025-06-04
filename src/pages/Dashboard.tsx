import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { ShoppingBag, Package, Clock, Settings, CheckCircle, XCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChangePasswordCard from "@/components/ChangePasswordCard";
import { orderService } from "@/services/orderService";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(true);
  const [stats, setStats] = useState({
    totalPurchases: 0,
    totalItems: 0,
    lastPurchaseDate: null as string | null
  });

  // Cargar órdenes del usuario directamente
  useEffect(() => {
    const loadUserOrders = async () => {
      if (!user) {
        console.log('❌ No hay usuario, no se cargan órdenes');
        setPurchases([]);
        setLoadingPurchases(false);
        return;
      }

      try {
        console.log('📦 Cargando órdenes del usuario en Dashboard...');
        setLoadingPurchases(true);
        const orders = await orderService.getUserOrders();
        
        const formattedPurchases = orders.map(order => ({
          id: order.id,
          date: order.created_at || new Date().toISOString(),
          total: order.total,
          items: order.items,
          status: order.status
        }));
        
        setPurchases(formattedPurchases);
        console.log('✅ Órdenes del usuario cargadas en Dashboard:', formattedPurchases.length);
      } catch (error) {
        console.error('❌ Error cargando órdenes del usuario en Dashboard:', error);
        setPurchases([]);
      } finally {
        setLoadingPurchases(false);
      }
    };

    loadUserOrders();
  }, [user]);

  // Calcular estadísticas basadas en las compras reales de Supabase
  useEffect(() => {
    if (purchases && purchases.length > 0) {
      const totalItems = purchases.reduce((sum, purchase) => {
        return sum + (Array.isArray(purchase.items) ? purchase.items.length : 0);
      }, 0);

      const lastPurchase = purchases[0]; // Las compras vienen ordenadas por fecha desc
      
      setStats({
        totalPurchases: purchases.length,
        totalItems,
        lastPurchaseDate: lastPurchase?.date || null
      });
    } else {
      setStats({
        totalPurchases: 0,
        totalItems: 0,
        lastPurchaseDate: null
      });
    }
  }, [purchases]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendiente: { label: 'Pendiente', variant: 'default' as const, icon: Clock, className: 'bg-blue-500 text-white hover:bg-blue-600' },
      procesando: { label: 'Procesando', variant: 'default' as const, icon: Package, className: 'bg-yellow-500 text-white hover:bg-yellow-600' },
      completada: { label: 'Completada', variant: 'default' as const, icon: CheckCircle, className: 'bg-green-500 text-white hover:bg-green-600' },
      cancelada: { label: 'Cancelada', variant: 'default' as const, icon: XCircle, className: 'bg-red-500 text-white hover:bg-red-600' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendiente;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={`flex items-center gap-1 ${config.className}`}>
        <Icon size={12} />
        {config.label}
      </Badge>
    );
  };

  if (loading || loadingPurchases) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-lg">Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Bienvenido, {user?.email || 'Usuario'}!
          </h1>
          <p className="text-gray-600">
            Aquí puedes ver tu historial de compras y gestionar tu cuenta.
          </p>
        </div>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Package size={16} />
              <span>Resumen</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings size={16} />
              <span>Configuración</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Compras Totales
                  </CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPurchases}</div>
                  <p className="text-xs text-muted-foreground">
                    Este año escolar
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t('dashboard.items')} Comprados
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalItems}</div>
                  <p className="text-xs text-muted-foreground">
                    Total de artículos
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Última Compra
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.lastPurchaseDate ? new Date(stats.lastPurchaseDate).toLocaleDateString() : 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Fecha más reciente
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Purchase History */}
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.purchaseHistory')}</CardTitle>
                <CardDescription>
                  Revisa todas tus compras anteriores de útiles escolares.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {purchases.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {t('dashboard.noPurchases')}
                    </h3>
                    <p className="text-gray-600">
                      {t('dashboard.noPurchasesDesc')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {purchases.map((purchase) => (
                      <div key={purchase.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            Orden #{purchase.id.slice(0, 8)}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {Array.isArray(purchase.items) ? purchase.items.length : 0} artículos
                          </p>
                          <p className="text-xs text-gray-500">
                            {t('dashboard.orderDate')}: {new Date(purchase.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">${purchase.total}</p>
                          {getStatusBadge(purchase.status || 'pending')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-8">
            <div className="grid gap-6">
              <ChangePasswordCard />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
