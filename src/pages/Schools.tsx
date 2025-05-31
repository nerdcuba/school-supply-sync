
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Users, BookOpen } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { defaultSchoolImages } from "@/utils/defaultSchoolImages";

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
  },
  {
    id: "miami-senior-high",
    name: "Miami Senior High School",
    address: "2450 SW 1st St, Miami, FL 33135",
    students: 2100,
    grades: "9-12",
    description: "Tradición de excelencia académica y deportiva.",
  },
  {
    id: "aventura-waterways",
    name: "Aventura Waterways K-8",
    address: "3500 NE 207th St, Aventura, FL 33180",
    students: 1200,
    grades: "K-8",
    description: "Educación integral en un ambiente innovador.",
  },
  {
    id: "pinecrest-elementary",
    name: "Pinecrest Elementary School",
    address: "5855 SW 111th St, Pinecrest, FL 33156",
    students: 720,
    grades: "K-5",
    description: "Fomentando la creatividad y el pensamiento crítico.",
  }
];

const Schools = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useLanguage();

  const filteredSchools = schoolsData.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Limit to first 9 schools for 3x3 grid on large screens
  const displaySchools = filteredSchools.slice(0, 9);

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
            <h3 className="text-2xl font-bold text-textPrimary mb-2">{schoolsData.length}</h3>
            <p className="text-textPrimary">{t('schools.select')}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg text-center border border-primary">
            <div className="text-secondary mb-2">
              <Users size={32} className="mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-textPrimary mb-2">
              {schoolsData.reduce((sum, school) => sum + school.students, 0).toLocaleString()}
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

        {/* Schools Grid - Responsive 3x3 on large, 2 columns on medium, 1 on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {displaySchools.map((school, index) => (
            <Card
              key={school.id}
              className="relative overflow-hidden group h-80 transform transition-all duration-200 ease-out hover:scale-105 hover:shadow-xl"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={defaultSchoolImages[index % defaultSchoolImages.length]}
                  alt={school.name}
                  className="w-full h-full object-cover"
                />
                {/* Overlay for text readability */}
                <div className="absolute inset-0 bg-black opacity-20"></div>
              </div>

              {/* Content with uniform size covering entire card */}
              <div className="relative z-10 bg-white bg-opacity-60 h-full flex flex-col">
                <CardHeader className="pb-4 flex-shrink-0">
                  <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                    {school.name}
                  </CardTitle>
                  <div className="flex items-start space-x-2 text-textPrimary">
                    <MapPin size={16} className="mt-0.5 flex-shrink-0 text-gray-400" />
                    <p className="text-base font-bold line-clamp-2">{school.address}</p>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <p className="text-textPrimary text-base font-bold line-clamp-3">
                      {school.description}
                    </p>
                    
                    <div className="flex justify-between text-base font-bold text-textPrimary">
                      <span>Grados: {school.grades}</span>
                      <span>{school.students} {t('schools.students')}</span>
                    </div>
                  </div>
                  
                  <Link to={`/school/${school.id}`} className="mt-4">
                    <Button className="w-full btn-vibrant">
                      {t('schools.viewSupplies')}
                    </Button>
                  </Link>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredSchools.length === 0 && (
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
