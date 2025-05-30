
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { School, MapPin, Users } from "lucide-react";

interface SchoolSelectorProps {
  onSelectSchool: (school: string) => void;
  searchTerm: string;
}

const schools = [
  {
    name: "Redland Elementary School",
    district: "Miami-Dade County",
    grades: "K-5",
    students: 650,
    address: "24205 SW 162nd Ave, Homestead, FL"
  },
  {
    name: "Sunset Elementary School",
    district: "Miami-Dade County",
    grades: "K-5",
    students: 580,
    address: "5120 SW 72nd St, Miami, FL"
  },
  {
    name: "Pinecrest Elementary School",
    district: "Miami-Dade County",
    grades: "K-5",
    students: 720,
    address: "5855 SW 111th St, Pinecrest, FL"
  },
  {
    name: "Coral Gables Elementary",
    district: "Miami-Dade County",
    grades: "K-5",
    students: 490,
    address: "105 Minorca Ave, Coral Gables, FL"
  },
  {
    name: "Aventura Waterways K-8",
    district: "Miami-Dade County",
    grades: "K-8",
    students: 1200,
    address: "3500 NE 207th St, Aventura, FL"
  },
  {
    name: "Palmetto Middle School",
    district: "Miami-Dade County",
    grades: "6-8",
    students: 890,
    address: "7460 SW 118th St, Pinecrest, FL"
  },
  {
    name: "Miami Senior High School",
    district: "Miami-Dade County",
    grades: "9-12",
    students: 2100,
    address: "2450 SW 1st St, Miami, FL"
  },
  {
    name: "Coral Reef Senior High",
    district: "Miami-Dade County",
    grades: "9-12",
    students: 1800,
    address: "10101 SW 152nd St, Miami, FL"
  }
];

const SchoolSelector = ({ onSelectSchool, searchTerm }: SchoolSelectorProps) => {
  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Selecciona tu Escuela</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Encuentra tu escuela en nuestra lista y accede a las listas de útiles específicas para cada grado.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchools.map((school) => (
          <Card
            key={school.name}
            className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-blue-300 group"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <School size={24} />
                </div>
                <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                  {school.grades}
                </span>
              </div>
              <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                {school.name}
              </CardTitle>
              <CardDescription className="text-sm">
                {school.district}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin size={14} className="mr-2 text-gray-400" />
                <span className="truncate">{school.address}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Users size={14} className="mr-2 text-gray-400" />
                <span>{school.students} estudiantes</span>
              </div>
              <Button
                onClick={() => onSelectSchool(school.name)}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Ver Listas de Útiles
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSchools.length === 0 && (
        <div className="text-center py-12">
          <School size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron escuelas</h3>
          <p className="text-gray-600">
            No hay escuelas que coincidan con tu búsqueda. Intenta con otro término.
          </p>
        </div>
      )}
    </div>
  );
};

export default SchoolSelector;
