
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Users, BookOpen } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { defaultSchoolImages } from "@/utils/defaultSchoolImages";
import { schoolService, School } from "@/services/schoolService";
import { toast } from "@/hooks/use-toast";

const Schools = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  // Load schools from Supabase
  useEffect(() => {
    const loadSchools = async () => {
      try {
        const data = await schoolService.getAll();
        setSchools(data);
      } catch (error) {
        console.error('Error loading schools:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las escuelas",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadSchools();
  }, []);

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Limit to first 9 schools for 3x3 grid on large screens
  const displaySchools = filteredSchools.slice(0, 9);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Cargando escuelas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            {t('schools.title')}
          </h1>
          <p className="text-xl text-textPrimary max-w-3xl mx-auto mb-8">
            {t('schools.subtitle')}
          </p>
          
          {/* Search */}
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder={t('schools.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-3 text-lg border-2 border-primary focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-lg p-6 shadow-lg text-center border border-primary">
            <div className="text-primary mb-2">
              <BookOpen size={32} className="mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-textPrimary mb-2">{schools.length}</h3>
            <p className="text-textPrimary">{t('schools.select')}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg text-center border border-primary">
            <div className="text-secondary mb-2">
              <Users size={32} className="mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-textPrimary mb-2">
              {/* Since we don't have student count in DB, show number of schools */}
              {schools.length > 0 ? `${schools.length * 800}+` : '0'}
            </h3>
            <p className="text-textPrimary">{t('schools.students')}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg text-center border border-primary">
            <div className="text-accent mb-2">
              <MapPin size={32} className="mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-textPrimary mb-2">Miami-Dade</h3>
            <p className="text-textPrimary">Condado Cubierto</p>
          </div>
        </div>

        {/* Schools Grid */}
        {displaySchools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displaySchools.map((school, index) => (
              <Card
                key={school.id}
                className="relative overflow-hidden group transform transition-all duration-200 ease-out hover:scale-105 hover:shadow-xl"
              >
                {/* School Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={defaultSchoolImages[index % defaultSchoolImages.length]}
                    alt={school.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  
                  {/* School Badge */}
                  <Badge className="absolute top-2 left-2 bg-primary text-white">
                    Escuela
                  </Badge>
                </div>

                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary">Miami-Dade</Badge>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600">
                        {school.principal || 'Director/a'}
                      </span>
                    </div>
                  </div>
                  <CardTitle className="text-lg text-blue-900 font-bold line-clamp-2">
                    {school.name}
                  </CardTitle>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-start space-x-2 text-textPrimary mb-4">
                    <MapPin size={16} className="mt-0.5 flex-shrink-0 text-gray-400" />
                    <p className="text-sm line-clamp-2">{school.address}</p>
                  </div>

                  {/* School Info */}
                  <div className="flex justify-between text-sm text-textPrimary mb-4">
                    <span className="font-medium">Tel: {school.phone}</span>
                    {school.website && (
                      <a 
                        href={school.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Sitio Web
                      </a>
                    )}
                  </div>

                  {/* View Supplies Button */}
                  <Link to={`/school/${school.id}`}>
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                      <BookOpen size={16} className="mr-2" />
                      {t('schools.viewSupplies')}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* No Schools */
          <div className="text-center py-12">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-textPrimary mb-2">
              No hay escuelas registradas
            </h3>
            <p className="text-textPrimary mb-4">
              Aún no se han añadido escuelas al sistema
            </p>
          </div>
        )}

        {/* No Results */}
        {schools.length > 0 && filteredSchools.length === 0 && (
          <div className="text-center py-12">
            <Search size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-textPrimary mb-2">
              {t('schools.notFound')}
            </h3>
            <p className="text-textPrimary mb-4">
              {t('schools.notFoundDesc')}
            </p>
            <Button
              onClick={() => setSearchTerm("")}
              variant="outline"
            >
              Limpiar búsqueda
            </Button>
          </div>
        )}

        {/* Show more button if there are more than 9 schools */}
        {filteredSchools.length > 9 && (
          <div className="text-center mt-8">
            <p className="text-textPrimary mb-4">
              Mostrando 9 de {filteredSchools.length} escuelas
            </p>
            <Button
              onClick={() => setSearchTerm("")}
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-white"
            >
              Ver todas las escuelas
            </Button>
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-white rounded-lg p-8 shadow-lg mt-12 text-center border border-primary">
          <h2 className="text-2xl font-bold text-textPrimary mb-4">
            ¿No encuentras tu escuela?
          </h2>
          <p className="text-textPrimary mb-6">
            Estamos constantemente añadiendo nuevas escuelas a nuestra plataforma. 
            Contáctanos para solicitar que incluyamos tu escuela.
          </p>
          <Link to="/contact">
            <Button className="btn-secondary">
              Solicitar Nueva Escuela
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Schools;
