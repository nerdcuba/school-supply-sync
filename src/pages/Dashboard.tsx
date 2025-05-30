import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { ShoppingBag, Package, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  // Mock purchase history data
  const purchases = [
    {
      id: "1",
      date: "2024-01-15",
      school: "Redland Elementary School",
      grade: "3er Grado",
      items: 15,
      total: 89.99
    },
    {
      id: "2", 
      date: "2024-01-10",
      school: "Sunset Elementary School",
      grade: "1er Grado", 
      items: 12,
      total: 67.50
    }
  ];

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

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Compras Totales
              </CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{purchases.length}</div>
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
              <div className="text-2xl font-bold">
                {purchases.reduce((sum, purchase) => sum + purchase.items, 0)}
              </div>
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
                {purchases.length > 0 ? new Date(purchases[0].date).toLocaleDateString() : 'N/A'}
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
                      <h4 className="font-semibold text-gray-900">{purchase.school}</h4>
                      <p className="text-sm text-gray-600">{purchase.grade}</p>
                      <p className="text-xs text-gray-500">
                        {t('dashboard.orderDate')}: {new Date(purchase.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${purchase.total}</p>
                      <p className="text-sm text-gray-600">{purchase.items} {t('dashboard.items')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
