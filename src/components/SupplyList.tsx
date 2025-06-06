
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, Printer, ArrowLeft, Package } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { schoolService } from "@/services/schoolService";
import { adminSupplyPackService, AdminSupplyPack } from "@/services/adminSupplyPackService";

interface SupplyListProps {
  school: string;
  grade: string | null;
  onSelectGrade: (grade: string) => void;
  onAddToCart: (item: any) => void;
}

const categoryColors: { [key: string]: string } = {
  "Arte": "bg-purple-100 text-purple-800",
  "Escritura": "bg-blue-100 text-blue-800",
  "Papel": "bg-green-100 text-green-800",
  "Oficina": "bg-yellow-100 text-yellow-800",
  "Organización": "bg-orange-100 text-orange-800",
  "Matemáticas": "bg-red-100 text-red-800",
  "Referencia": "bg-indigo-100 text-indigo-800"
};

const SupplyList = ({ school, grade, onSelectGrade, onAddToCart }: SupplyListProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [schoolData, setSchoolData] = useState<any>(null);
  const [supplyPacks, setSupplyPacks] = useState<AdminSupplyPack[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos de la escuela y packs desde Supabase
  useEffect(() => {
    const loadSchoolData = async () => {
      try {
        setLoading(true);
        const [schools, allPacks] = await Promise.all([
          schoolService.getAll(),
          adminSupplyPackService.getAll()
        ]);
        
        const currentSchool = schools.find(s => s.name === school);
        setSchoolData(currentSchool);
        
        // Filtrar packs por escuela
        const schoolPacks = allPacks.filter(pack => 
          pack.schoolName === school || pack.schoolId === currentSchool?.id
        );
        setSupplyPacks(schoolPacks);
      } catch (error) {
        console.error('Error loading school data:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información de la escuela",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadSchoolData();
  }, [school]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Cargando información de la escuela...</div>
      </div>
    );
  }

  if (!grade) {
    // Obtener grados únicos de los packs de esta escuela
    const availableGrades = [...new Set(supplyPacks.map(pack => pack.grade))].sort();
    
    if (availableGrades.length === 0) {
      return (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Listas de Útiles - {school}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              No hay packs de útiles disponibles para esta escuela actualmente.
            </p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <Package size={48} className="mx-auto text-yellow-500 mb-4" />
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              Packs no disponibles
            </h3>
            <p className="text-yellow-700">
              Los packs de útiles para esta escuela están siendo preparados. 
              Por favor, contacta al administrador para más información.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Listas de Útiles - {school}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Selecciona el grado de tu hijo/a para ver la lista completa de útiles escolares disponible como pack.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableGrades.map((gradeOption) => {
            const gradePacks = supplyPacks.filter(pack => pack.grade === gradeOption);
            const packPrice = gradePacks.length > 0 ? gradePacks[0].price : 0;
            
            return (
              <Card
                key={gradeOption}
                className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-green-300 group"
                onClick={() => onSelectGrade(gradeOption)}
              >
                <CardHeader className="text-center pb-4">
                  <div className="bg-green-100 text-green-600 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center text-xl font-bold group-hover:bg-green-600 group-hover:text-white transition-colors">
                    <Package size={24} />
                  </div>
                  <CardTitle className="text-xl group-hover:text-green-600 transition-colors">
                    Pack {gradeOption}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-3">
                  <div className="space-y-1">
                    <p className="text-gray-600">
                      {gradePacks.reduce((total, pack) => total + pack.items.length, 0)} artículos incluidos
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      ${packPrice.toFixed(2)}
                    </p>
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    Ver Pack Completo
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Mostrar packs específicos del grado seleccionado
  const gradeSupplyPacks = supplyPacks.filter(pack => pack.grade === grade);
  
  if (gradeSupplyPacks.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Pack de Útiles - {grade}
          </h2>
          <p className="text-gray-600">{school}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <Package size={48} className="mx-auto text-yellow-500 mb-4" />
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Pack no disponible para {grade}
          </h3>
          <p className="text-yellow-700">
            El pack de útiles para {grade} no está disponible actualmente.
          </p>
        </div>
      </div>
    );
  }

  // Combinar todos los items de los packs del grado
  const allSupplies = gradeSupplyPacks.flatMap(pack => pack.items);
  const categories = [...new Set(allSupplies.map(supply => supply.category || 'General'))];
  const filteredSupplies = selectedCategory
    ? allSupplies.filter(supply => (supply.category || 'General') === selectedCategory)
    : allSupplies;

  const totalCost = gradeSupplyPacks.length > 0 ? gradeSupplyPacks[0].price : 0;

  const handleAddPackToCart = () => {
    const packItem = {
      id: `pack-${grade?.toLowerCase().replace(/\s+/g, '-')}-${school.toLowerCase().replace(/\s+/g, '-')}`,
      name: `Pack Completo ${grade} - ${school}`,
      brand: "Plan Ahead Solutions",
      price: totalCost,
      quantity: 1,
      category: "Pack Completo",
      supplies: allSupplies,
      school: school,
      grade: grade
    };
    
    onAddToCart(packItem);
    toast({
      title: "Pack agregado al carrito",
      description: `Pack completo de ${grade} para ${school} agregado a tu carrito con ${allSupplies.length} artículos.`,
    });
  };

  const handleDownloadList = () => {
    toast({
      title: "Descargando lista",
      description: "La lista de útiles se descargará en formato PDF.",
    });
  };

  const handlePrintList = () => {
    window.print();
    toast({
      title: "Imprimiendo lista",
      description: "Se abrirá el diálogo de impresión.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Pack Option */}
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Pack de Útiles - {grade}
              </h2>
              <p className="text-gray-600">{school}</p>
              {schoolData && (
                <p className="text-sm text-gray-500 mt-1">
                  {schoolData.address} • {schoolData.phone}
                </p>
              )}
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm text-gray-500">{allSupplies.length} artículos</span>
                <span className="text-lg font-bold text-green-600">
                  Total del pack: ${totalCost.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleDownloadList}
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <Download size={16} className="mr-2" />
                Descargar
              </Button>
              <Button
                variant="outline"
                onClick={handlePrintList}
                className="border-gray-600 text-gray-600 hover:bg-gray-50"
              >
                <Printer size={16} className="mr-2" />
                Imprimir
              </Button>
            </div>
          </div>
          
          {/* Pack Purchase Section */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
              <div>
                <h3 className="text-lg font-semibold text-green-800 mb-1">
                  Compra el Pack Completo
                </h3>
                <p className="text-green-700 text-sm">
                  Todos los útiles necesarios para {grade} en un solo pack. ¡Ahorra tiempo y dinero!
                </p>
              </div>
              <Button
                onClick={handleAddPackToCart}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white min-w-[200px]"
              >
                <Package size={20} className="mr-2" />
                Agregar Pack - ${totalCost.toFixed(2)}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-lg p-4 shadow-lg">
        <h3 className="text-lg font-semibold mb-3">Contenido del pack por categoría:</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            size="sm"
          >
            Todo el pack ({allSupplies.length})
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              size="sm"
              className={selectedCategory === category ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              {category} ({allSupplies.filter(s => (s.category || 'General') === category).length})
            </Button>
          ))}
        </div>
      </div>

      {/* Supply Items - Showing pack contents */}
      <div className="grid gap-4">
        <div className="text-center mb-4">
          <h4 className="text-lg font-medium text-gray-700">
            Artículos incluidos en el pack:
          </h4>
        </div>
        
        {filteredSupplies.map((supply, index) => (
          <Card key={`${supply.id}-${index}`} className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{supply.name}</h4>
                    <Badge className={categoryColors[supply.category || 'General'] || "bg-gray-100 text-gray-800"}>
                      {supply.category || 'General'}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Cantidad incluida: {supply.quantity}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSupplies.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay artículos en esta categoría.</p>
        </div>
      )}
    </div>
  );
};

export default SupplyList;
