
import { useQuery } from '@tanstack/react-query';
import { secureSchoolService } from '@/services/secureSchoolService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, GraduationCap, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

const Schools = () => {
  const { t } = useLanguage();

  const { data: schools, isLoading, error } = useQuery({
    queryKey: ['schools'],
    queryFn: secureSchoolService.getActiveSchools,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-600">
            Error al cargar las escuelas. Por favor intenta de nuevo.
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">
            {t('schools.title')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('schools.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schools?.map((school) => (
            <Card key={school.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="mr-2 text-primary" size={24} />
                  {school.name}
                </CardTitle>
                {school.grades && (
                  <CardDescription>{school.grades}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start">
                  <MapPin className="mr-2 mt-1 text-gray-500" size={16} />
                  <span className="text-sm text-gray-600">{school.address}</span>
                </div>
                
                {school.phone && (
                  <div className="flex items-center">
                    <Phone className="mr-2 text-gray-500" size={16} />
                    <span className="text-sm text-gray-600">{school.phone}</span>
                  </div>
                )}

                {school.principal && (
                  <div className="text-sm">
                    <span className="font-medium">Director:</span> {school.principal}
                  </div>
                )}

                {school.enrollment && (
                  <div className="text-sm">
                    <span className="font-medium">Estudiantes:</span> {school.enrollment.toLocaleString()}
                  </div>
                )}

                <div className="pt-4 space-y-2">
                  <Link to={`/school-supplies?school=${school.id}`}>
                    <Button className="w-full">
                      Ver Lista de Útiles
                    </Button>
                  </Link>
                  
                  {school.website && (
                    <a 
                      href={school.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button variant="outline" className="w-full">
                        <ExternalLink className="mr-2" size={16} />
                        Sitio Web
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {schools?.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="mx-auto mb-4 text-gray-400" size={64} />
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              No hay escuelas disponibles
            </h3>
            <p className="text-gray-500">
              Próximamente tendremos más escuelas asociadas.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Schools;
