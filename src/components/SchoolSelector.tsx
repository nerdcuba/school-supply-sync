
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { School, MapPin, Users, BookOpen } from "lucide-react";
import { schoolService, School as SchoolType } from "@/services/schoolService";
import { toast } from "@/hooks/use-toast";

interface SchoolSelectorProps {
  onSelectSchool: (school: string) => void;
  searchTerm: string;
}

const SchoolSelector = ({ onSelectSchool, searchTerm }: SchoolSelectorProps) => {
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [loading, setLoading] = useState(true);

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
    school.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.grades.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Cargando escuelas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Selecciona tu Escuela</h2>
        <p className="text-textPrimary max-w-2xl mx-auto">
          Encuentra tu escuela en nuestra lista y accede a las listas de útiles específicas para cada grado.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchools.map((school) => (
          <Card
            key={school.id}
            className="card-vibrant cursor-pointer group"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-lg group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <School size={24} />
                </div>
                <span className="text-sm bg-accent bg-opacity-20 text-accent px-2 py-1 rounded-full font-medium">
                  {school.grades}
                </span>
              </div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {school.name}
              </CardTitle>
              <CardDescription className="text-sm">
                {school.address}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm text-textPrimary">
                <MapPin size={14} className="mr-2 text-gray-400" />
                <span className="truncate">{school.address}</span>
              </div>
              <div className="flex items-center text-sm text-textPrimary">
                <BookOpen size={14} className="mr-2 text-gray-400" />
                <span>Grados {school.grades}</span>
              </div>
              <div className="flex items-center text-sm text-textPrimary">
                <Users size={14} className="mr-2 text-gray-400" />
                <span>{school.enrollment.toLocaleString()} estudiantes</span>
              </div>
              <Button
                onClick={() => onSelectSchool(school.name)}
                className="w-full mt-4 btn-vibrant"
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
          <h3 className="text-xl font-semibold mb-2">No se encontraron escuelas</h3>
          <p className="text-textPrimary">
            No hay escuelas que coincidan con tu búsqueda. Intenta con otro término.
          </p>
        </div>
      )}
    </div>
  );
};

export default SchoolSelector;
