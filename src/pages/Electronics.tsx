
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingCart, Star, Filter } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { electronicsService, ElectronicFrontend } from "@/services/electronicsService";
import { useToast } from "@/hooks/use-toast";

const categories = ["Todos", "Laptops", "Tablets", "Audífonos", "Grabadores", "Calculadoras", "Accesorios"];

interface ElectronicsProps {
  onAddToCart?: (item: any) => void;
}

const Electronics = ({ onAddToCart }: ElectronicsProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [electronics, setElectronics] = useState<ElectronicFrontend[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    fetchElectronics();
  }, []);

  const fetchElectronics = async () => {
    try {
      const { data, error } = await electronicsService.getElectronics();
      if (error) throw error;
      setElectronics(data);
    } catch (error) {
      console.error('Error fetching electronics:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos electrónicos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredElectronics = electronics.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "Todos" || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: ElectronicFrontend) => {
    if (onAddToCart) {
      onAddToCart({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        category: product.category
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-xl">Cargando productos electrónicos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-textPrimary">
            Electrónicos para Estudiantes
          </h1>
          <p className="text-xl text-textPrimary max-w-3xl mx-auto mb-8">
            Encuentra laptops, tablets, audífonos y otros dispositivos electrónicos 
            esenciales para tu éxito académico
          </p>
          
          {/* Search */}
          <div className="max-w-xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Buscar productos electrónicos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-3 text-lg border-2 border-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={`${
                  selectedCategory === category 
                    ? "bg-primary text-white" 
                    : "border-primary text-primary hover:bg-primary hover:text-white"
                } transition-all duration-200`}
              >
                <Filter size={16} className="mr-2" />
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-lg p-6 shadow-lg text-center border border-primary">
            <div className="text-primary mb-2">
              <ShoppingCart size={32} className="mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-textPrimary mb-2">{electronics.length}</h3>
            <p className="text-textPrimary">Productos Disponibles</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg text-center border border-primary">
            <div className="text-secondary mb-2">
              <Star size={32} className="mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-textPrimary mb-2">
              {electronics.length > 0 ? (electronics.reduce((acc, e) => acc + e.rating, 0) / electronics.length).toFixed(1) : '0'}
            </h3>
            <p className="text-textPrimary">Calificación Promedio</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg text-center border border-primary">
            <div className="text-accent mb-2">
              <ShoppingCart size={32} className="mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-textPrimary mb-2">Envío</h3>
            <p className="text-textPrimary">Gratis en pedidos +$50</p>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredElectronics.map((product) => (
            <Card
              key={product.id}
              className="relative overflow-hidden group transform transition-all duration-200 ease-out hover:scale-105 hover:shadow-xl"
            >
              {/* Product Image */}
              <div className="relative h-64 overflow-hidden bg-gray-50">
                <img
                  src={product.image || "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=300&fit=crop"}
                  alt={product.name}
                  className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                />
                {!product.in_stock && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <Badge variant="destructive" className="text-lg px-4 py-2">
                      Agotado
                    </Badge>
                  </div>
                )}
                {product.original_price && product.original_price > product.price && (
                  <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                    -${(product.original_price - product.price).toFixed(0)}
                  </Badge>
                )}
              </div>

              <CardHeader className="pb-2">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary">{product.category}</Badge>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600">
                      {product.rating} ({product.reviews})
                    </span>
                  </div>
                </div>
                <CardTitle className="text-lg text-blue-900 font-bold line-clamp-2">
                  {product.name}
                </CardTitle>
                <p className="text-sm text-gray-600 font-medium">{product.brand}</p>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-textPrimary text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>

                {/* Features */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {product.features.slice(0, 2).map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {product.features.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{product.features.length - 2} más
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-primary">
                      ${product.price}
                    </span>
                    {product.original_price && product.original_price > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        ${product.original_price}
                      </span>
                    )}
                  </div>
                </div>

                {/* Add to Cart Button */}
                <Button
                  onClick={() => handleAddToCart(product)}
                  disabled={!product.in_stock}
                  className={`w-full ${
                    product.in_stock 
                      ? "bg-green-600 hover:bg-green-700 text-white" 
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <ShoppingCart size={16} className="mr-2" />
                  {product.in_stock ? "Agregar al Carrito" : "Agotado"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredElectronics.length === 0 && (
          <div className="text-center py-12">
            <Search size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-textPrimary mb-2">
              No se encontraron productos
            </h3>
            <p className="text-textPrimary mb-4">
              Intenta con otros términos de búsqueda o categorías diferentes
            </p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("Todos");
              }}
              variant="outline"
            >
              Limpiar filtros
            </Button>
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-white rounded-lg p-8 shadow-lg mt-12 text-center border border-primary">
          <h2 className="text-2xl font-bold text-textPrimary mb-4">
            ¿Necesitas ayuda para elegir?
          </h2>
          <p className="text-textPrimary mb-6">
            Nuestro equipo de expertos puede ayudarte a encontrar los productos 
            electrónicos perfectos para tus necesidades académicas.
          </p>
          <Button className="btn-secondary">
            Contactar Especialista
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Electronics;
