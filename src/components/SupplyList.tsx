
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, Print, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SupplyListProps {
  school: string;
  grade: string | null;
  onSelectGrade: (grade: string) => void;
  onAddToCart: (item: any) => void;
}

const gradeData = {
  "Kindergarten": {
    supplies: [
      { id: "k1", name: "Crayones de 24 colores", brand: "Crayola", price: 3.99, quantity: 2, category: "Arte" },
      { id: "k2", name: "Marcadores lavables", brand: "Crayola", price: 4.99, quantity: 1, category: "Arte" },
      { id: "k3", name: "Pegamento en barra", brand: "Elmer's", price: 1.99, quantity: 4, category: "Oficina" },
      { id: "k4", name: "Tijeras punta roma", brand: "Fiskars", price: 3.49, quantity: 1, category: "Oficina" },
      { id: "k5", name: "Cuadernos de composición", brand: "Mead", price: 2.99, quantity: 3, category: "Papel" },
      { id: "k6", name: "Lápices #2", brand: "Ticonderoga", price: 4.99, quantity: 1, category: "Escritura" },
      { id: "k7", name: "Carpetas de plástico", brand: "Generic", price: 0.99, quantity: 5, category: "Organización" }
    ]
  },
  "1er Grado": {
    supplies: [
      { id: "1g1", name: "Lápices #2", brand: "Ticonderoga", price: 4.99, quantity: 2, category: "Escritura" },
      { id: "1g2", name: "Borradores rosas", brand: "Pink Pearl", price: 1.99, quantity: 4, category: "Escritura" },
      { id: "1g3", name: "Crayones de 24 colores", brand: "Crayola", price: 3.99, quantity: 1, category: "Arte" },
      { id: "1g4", name: "Marcadores lavables", brand: "Crayola", price: 4.99, quantity: 1, category: "Arte" },
      { id: "1g5", name: "Cuadernos rayados", brand: "Mead", price: 2.99, quantity: 4, category: "Papel" },
      { id: "1g6", name: "Folders manila", brand: "Generic", price: 0.79, quantity: 10, category: "Organización" },
      { id: "1g7", name: "Pegamento líquido", brand: "Elmer's", price: 2.49, quantity: 2, category: "Oficina" }
    ]
  },
  "2do Grado": {
    supplies: [
      { id: "2g1", name: "Lápices #2", brand: "Ticonderoga", price: 4.99, quantity: 2, category: "Escritura" },
      { id: "2g2", name: "Lápices de colores", brand: "Crayola", price: 5.99, quantity: 1, category: "Arte" },
      { id: "2g3", name: "Cuadernos de matemáticas", brand: "Mead", price: 3.49, quantity: 2, category: "Papel" },
      { id: "2g4", name: "Cuadernos de escritura", brand: "Mead", price: 3.49, quantity: 2, category: "Papel" },
      { id: "2g5", name: "Carpeta de 3 anillos", brand: "Avery", price: 7.99, quantity: 1, category: "Organización" },
      { id: "2g6", name: "Separadores de materias", brand: "Avery", price: 2.99, quantity: 1, category: "Organización" },
      { id: "2g7", name: "Regla de 12 pulgadas", brand: "Generic", price: 1.49, quantity: 1, category: "Matemáticas" }
    ]
  },
  "3er Grado": {
    supplies: [
      { id: "3g1", name: "Lápices #2", brand: "Ticonderoga", price: 4.99, quantity: 3, category: "Escritura" },
      { id: "3g2", name: "Bolígrafos azules", brand: "BIC", price: 3.99, quantity: 1, category: "Escritura" },
      { id: "3g3", name: "Bolígrafos rojos", brand: "BIC", price: 3.99, quantity: 1, category: "Escritura" },
      { id: "3g4", name: "Resaltadores", brand: "Sharpie", price: 4.99, quantity: 1, category: "Escritura" },
      { id: "3g5", name: "Cuadernos de espiral", brand: "Mead", price: 2.99, quantity: 4, category: "Papel" },
      { id: "3g6", name: "Papel rayado suelto", brand: "Mead", price: 3.99, quantity: 2, category: "Papel" },
      { id: "3g7", name: "Calculadora básica", brand: "Texas Instruments", price: 12.99, quantity: 1, category: "Matemáticas" }
    ]
  },
  "4to Grado": {
    supplies: [
      { id: "4g1", name: "Lápices mecánicos", brand: "BIC", price: 3.99, quantity: 2, category: "Escritura" },
      { id: "4g2", name: "Minas para lápiz mecánico", brand: "BIC", price: 2.99, quantity: 2, category: "Escritura" },
      { id: "4g3", name: "Bolígrafos de gel", brand: "Pilot", price: 6.99, quantity: 1, category: "Escritura" },
      { id: "4g4", name: "Cuadernos universitarios", brand: "Mead", price: 4.99, quantity: 3, category: "Papel" },
      { id: "4g5", name: "Carpetas expandibles", brand: "Pendaflex", price: 8.99, quantity: 2, category: "Organización" },
      { id: "4g6", name: "Notas adhesivas", brand: "Post-it", price: 4.99, quantity: 2, category: "Oficina" },
      { id: "4g7", name: "Transportador", brand: "Generic", price: 2.49, quantity: 1, category: "Matemáticas" }
    ]
  },
  "5to Grado": {
    supplies: [
      { id: "5g1", name: "Lápices mecánicos", brand: "BIC", price: 3.99, quantity: 3, category: "Escritura" },
      { id: "5g2", name: "Bolígrafos multicolor", brand: "BIC", price: 5.99, quantity: 1, category: "Escritura" },
      { id: "5g3", name: "Cuadernos de materias", brand: "Five Star", price: 7.99, quantity: 4, category: "Papel" },
      { id: "5g4", name: "Archivador acordeón", brand: "Pendaflex", price: 12.99, quantity: 1, category: "Organización" },
      { id: "5g5", name: "Calculadora científica", brand: "Texas Instruments", price: 24.99, quantity: 1, category: "Matemáticas" },
      { id: "5g6", name: "Set de geometría", brand: "Staedtler", price: 8.99, quantity: 1, category: "Matemáticas" },
      { id: "5g7", name: "Diccionario Inglés-Español", brand: "Merriam-Webster", price: 15.99, quantity: 1, category: "Referencia" }
    ]
  }
};

const grades = ["Kindergarten", "1er Grado", "2do Grado", "3er Grado", "4to Grado", "5to Grado"];

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

  if (!grade) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Listas de Útiles - {school}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Selecciona el grado de tu hijo/a para ver la lista completa de útiles escolares.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {grades.map((gradeOption) => (
            <Card
              key={gradeOption}
              className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-green-300 group"
              onClick={() => onSelectGrade(gradeOption)}
            >
              <CardHeader className="text-center pb-4">
                <div className="bg-green-100 text-green-600 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center text-xl font-bold group-hover:bg-green-600 group-hover:text-white transition-colors">
                  {gradeOption === "Kindergarten" ? "K" : gradeOption.charAt(0)}
                </div>
                <CardTitle className="text-xl group-hover:text-green-600 transition-colors">
                  {gradeOption}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  {gradeData[gradeOption as keyof typeof gradeData]?.supplies.length || 0} artículos
                </p>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Ver Lista Completa
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const supplies = gradeData[grade as keyof typeof gradeData]?.supplies || [];
  const categories = [...new Set(supplies.map(supply => supply.category))];
  const filteredSupplies = selectedCategory
    ? supplies.filter(supply => supply.category === selectedCategory)
    : supplies;

  const totalCost = supplies.reduce((total, supply) => total + (supply.price * supply.quantity), 0);

  const handleAddToCart = (supply: any) => {
    onAddToCart(supply);
    toast({
      title: "Agregado al carrito",
      description: `${supply.name} ha sido agregado a tu carrito.`,
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
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Lista de Útiles - {grade}
            </h2>
            <p className="text-gray-600">{school}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-sm text-gray-500">{supplies.length} artículos</span>
              <span className="text-sm font-semibold text-green-600">
                Total estimado: ${totalCost.toFixed(2)}
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
              <Print size={16} className="mr-2" />
              Imprimir
            </Button>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-lg p-4 shadow-lg">
        <h3 className="text-lg font-semibold mb-3">Filtrar por categoría:</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            size="sm"
          >
            Todas ({supplies.length})
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              size="sm"
              className={selectedCategory === category ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              {category} ({supplies.filter(s => s.category === category).length})
            </Button>
          ))}
        </div>
      </div>

      {/* Supply Items */}
      <div className="grid gap-4">
        {filteredSupplies.map((supply) => (
          <Card key={supply.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{supply.name}</h4>
                    <Badge className={categoryColors[supply.category] || "bg-gray-100 text-gray-800"}>
                      {supply.category}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-1">Marca recomendada: {supply.brand}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Cantidad necesaria: {supply.quantity}</span>
                    <span className="text-lg font-semibold text-green-600">${supply.price}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Subtotal</p>
                    <p className="text-lg font-bold text-gray-900">
                      ${(supply.price * supply.quantity).toFixed(2)}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleAddToCart(supply)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus size={16} className="mr-2" />
                    Agregar
                  </Button>
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
