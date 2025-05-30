
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Users, BookOpen } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const schoolsData = [
  {
    id: "redland-elementary",
    name: "Redland Elementary School",
    address: "24355 SW 167th Ave, Homestead, FL 33031",
    students: 650,
    grades: "K-5",
    description: "Una escuela elemental comprometida con la excelencia académica.",
  },
  {
    id: "sunset-elementary",
    name: "Sunset Elementary School", 
    address: "15600 SW 80th St, Miami, FL 33193",
    students: 720,
    grades: "K-5",
    description: "Formando líderes del mañana con educación de calidad.",
  },
  {
    id: "coral-gables-senior",
    name: "Coral Gables Senior High",
    address: "450 Bird Rd, Coral Gables, FL 33146",
    students: 1500,
    grades: "9-12",
    description: "Preparando estudiantes para el éxito universitario y profesional.",
  },
  {
    id: "palmetto-elementary",
    name: "Palmetto Elementary School",
    address: "7460 SW 120th St, Miami, FL 33156",
    students: 580,
    grades: "K-5",
    description: "Educación personalizada en un ambiente seguro y acogedor.",
  },
  {
    id: "southwood-middle",
    name: "Southwood Middle School",
    address: "13850 SW 26th St, Miami, FL 33175",
    students: 850,
    grades: "6-8",
    description: "Desarrollando habilidades críticas para el éxito futuro.",
  },
  {
    id: "westchester-elementary",
    name: "Westchester Elementary School",
    address: "9001 SW 24th St, Miami, FL 33165",
    students: 690,
    grades: "K-5",
    description: "Inspirando el amor por el aprendizaje en cada estudiante.",
  }
];

const Schools = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useLanguage();

  const filteredSchools = schoolsData.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('schools.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
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
                className="pl-10 py-3 text-lg border-2 border-blue-200 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <div className="text-blue-600 mb-2">
              <BookOpen size={32} className="mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{schoolsData.length}</h3>
            <p className="text-gray-600">{t('schools.select')}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <div className="text-green-600 mb-2">
              <Users size={32} className="mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {schoolsData.reduce((sum, school) => sum + school.students, 0).toLocaleString()}
            </h3>
            <p className="text-gray-600">{t('schools.students')}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <div className="text-yellow-600 mb-2">
              <MapPin size={32} className="mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Miami-Dade</h3>
            <p className="text-gray-600">Condado Cubierto</p>
          </div>
        </div>

        {/* Schools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchools.map((school) => (
            <Card
              key={school.id}
              className="hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-300 group"
            >
              <CardHeader className="pb-4">
                <CardTitle className="text-xl group-hover:text-blue-600 transition-colors line-clamp-2">
                  {school.name}
                </CardTitle>
                <div className="flex items-start space-x-2 text-gray-600">
                  <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                  <p className="text-sm line-clamp-2">{school.address}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm line-clamp-2">
                  {school.description}
                </p>
                
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Grados: {school.grades}</span>
                  <span>{school.students} {t('schools.students')}</span>
                </div>
                
                <Link to={`/school/${school.id}`}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white group-hover:bg-blue-700">
                    {t('schools.viewSupplies')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredSchools.length === 0 && (
          <div className="text-center py-12">
            <Search size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('schools.notFound')}
            </h3>
            <p className="text-gray-600 mb-4">
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

        {/* CTA Section */}
        <div className="bg-white rounded-lg p-8 shadow-lg mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¿No encuentras tu escuela?
          </h2>
          <p className="text-gray-600 mb-6">
            Estamos constantemente añadiendo nuevas escuelas a nuestra plataforma. 
            Contáctanos para solicitar que incluyamos tu escuela.
          </p>
          <Link to="/contact">
            <Button className="bg-green-600 hover:bg-green-700">
              Solicitar Nueva Escuela
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Schools;
