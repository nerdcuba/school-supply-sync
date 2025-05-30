
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { User, Package, ShoppingBag } from 'lucide-react';

const Dashboard = () => {
  const { user, updateProfile, purchases } = useAuth();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setIsEditing(false);
    toast({
      title: t('messages.profileUpdated'),
      description: t('messages.profileUpdatedDesc'),
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {t('dashboard.welcome')}, {user?.name}!
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={20} />
                {t('dashboard.profile')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">{t('auth.name')}</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">{t('auth.email')}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm">
                      {t('common.save')}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsEditing(false)}
                    >
                      {t('common.cancel')}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-2">
                  <p><strong>{t('auth.name')}:</strong> {user?.name}</p>
                  <p><strong>{t('auth.email')}:</strong> {user?.email}</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    {t('common.edit')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag size={20} />
                {t('dashboard.purchases')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">{purchases.length}</p>
              <p className="text-sm text-gray-600">{t('dashboard.totalPurchases')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package size={20} />
                {t('dashboard.totalSpent')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                ${purchases.reduce((total, purchase) => total + purchase.total, 0).toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">{t('dashboard.allTime')}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.recentPurchases')}</CardTitle>
            <CardDescription>{t('dashboard.recentPurchasesDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {purchases.length === 0 ? (
              <p className="text-gray-500">{t('dashboard.noPurchases')}</p>
            ) : (
              <div className="space-y-4">
                {purchases.slice(0, 5).map((purchase) => (
                  <div key={purchase.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{t('dashboard.order')} #{purchase.id}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(purchase.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {purchase.items.length} {t('dashboard.items')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${purchase.total.toFixed(2)}</p>
                        <p className="text-sm text-green-600">{purchase.status}</p>
                      </div>
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
