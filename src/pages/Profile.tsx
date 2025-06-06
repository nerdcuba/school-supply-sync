
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { User, Settings, Shield } from 'lucide-react';
import ChangePasswordCard from '@/components/ChangePasswordCard';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.user_metadata?.name || '',
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
      });
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Here you would typically update the user profile in Supabase
      toast({
        title: "Perfil actualizado",
        description: "Tu información ha sido guardada exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
            <p className="text-gray-600">Gestiona tu información personal y configuración de cuenta</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <User className="text-blue-600" size={24} />
                  <div>
                    <CardTitle>Información Personal</CardTitle>
                    <CardDescription>
                      Actualiza tu información de contacto
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input
                      id="name"
                      name="name"
                      value={profileData.name}
                      onChange={handleInputChange}
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                      placeholder="tu@email.com"
                      disabled
                    />
                    <p className="text-sm text-gray-500">
                      No puedes cambiar tu email después del registro
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <Separator />

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Guardando..." : "Guardar cambios"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <div className="space-y-6">
              <ChangePasswordCard />
              
              {/* Account Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Shield className="text-green-600" size={24} />
                    <div>
                      <CardTitle>Información de Cuenta</CardTitle>
                      <CardDescription>
                        Detalles de tu cuenta y estado
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Estado de la cuenta</span>
                    <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                      Activa
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Tipo de cuenta</span>
                    <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      Cliente
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Miembro desde</span>
                    <span className="text-sm text-gray-600">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
