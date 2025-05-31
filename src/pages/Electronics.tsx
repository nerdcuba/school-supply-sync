
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingCart, Star, Filter } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const electronicsData = [
  {
    id: "laptop-dell-1",
    name: "Dell Inspiron 15 3000",
    category: "Laptops",
    price: 449.99,
    originalPrice: 599.99,
    brand: "Dell",
    rating: 4.2,
    reviews: 124,
    description: "Laptop ideal para estudiantes con procesador Intel Core i5, 8GB RAM, 256GB SSD",
    image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=300&fit=crop",
    features: ["Intel Core i5", "8GB RAM", "256GB SSD", "15.6\" Display"],
    inStock: true
  },
  {
    id: "tablet-ipad-1",
    name: "iPad 9th Generation",
    category: "Tablets",
    price: 329.99,
    originalPrice: 399.99,
    brand: "Apple",
    rating: 4.7,
    reviews: 892,
    description: "Tablet perfecta para tomar notas, leer y proyectos escolares",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop",
    features: ["10.2\" Retina Display", "64GB Storage", "Touch ID", "All-Day Battery"],
    inStock: true
  },
  {
    id: "headphones-sony-1",
    name: "Sony WH-CH720N",
    category: "Audífonos",
    price: 89.99,
    originalPrice: 149.99,
    brand: "Sony",
    rating: 4.4,
    reviews: 256,
    description: "Audífonos con cancelación de ruido ideales para estudiar",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
    features: ["Noise Canceling", "Bluetooth 5.0", "35hr Battery", "Quick Charge"],
    inStock: true
  },
  {
    id: "recorder-olympus-1",
    name: "Olympus VN-541PC",
    category: "Grabadores",
    price: 39.99,
    originalPrice: 59.99,
    brand: "Olympus",
    rating: 4.1,
    reviews: 78,
    description: "Grabador de voz digital para conferencias y clases",
    image: "https://images.unsplash.com/photo-1590658165737-15a047b7a2c8?w=400&h=300&fit=crop",
    features: ["4GB Memory", "USB Direct", "Voice Playback", "Long Battery Life"],
    inStock: true
  },
  {
    id: "laptop-hp-1",
    name: "HP Pavilion 14",
    category: "Laptops",
    price: 549.99,
    originalPrice: 699.99,
    brand: "HP",
    rating: 4.3,
    reviews: 167,
    description: "Laptop compacta y potente para estudiantes universitarios",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop",
    features: ["AMD Ryzen 5", "8GB RAM", "512GB SSD", "14\" Full HD"],
    inStock: true
  },
  {
    id: "tablet-samsung-1",
    name: "Samsung Galaxy Tab A8",
    category: "Tablets",
    price: 199.99,
    originalPrice: 279.99,
    brand: "Samsung",
    rating: 4.0,
    reviews: 145,
    description: "Tablet Android versátil para estudios y entretenimiento",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop",
    features: ["10.5\" Display", "32GB Storage", "Quad Speakers", "Long Battery"],
    inStock: false
  },
  {
    id: "headphones-bose-1",
    name: "Bose QuietComfort 45",
    category: "Audífonos",
    price: 279.99,
    originalPrice: 329.99,
    brand: "Bose",
    rating: 4.8,
    reviews: 534,
    description: "Audífonos premium con la mejor cancelación de ruido",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
    features: ["World-Class Noise Canceling", "22hr Battery", "TriPort Technology", "Comfortable Fit"],
    inStock: true
  },
  {
    id: "calculator-ti-1",
    name: "Texas Instruments TI-84 Plus CE",
    category: "Calculadoras",
    price: 119.99,
    originalPrice: 149.99,
    brand: "Texas Instruments",
    rating: 4.6,
    reviews: 312,
    description: "Calculadora gráfica para matemáticas avanzadas y ciencias",
    image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop",
    features: ["Color Display", "Rechargeable", "Pre-loaded Apps", "Graphing Capabilities"],
    inStock: true
  },
  {
    id: "mouse-logitech-1",
    name: "Logitech MX Master 3S",
    category: "Accesorios",
    price: 99.99,
    originalPrice: 129.99,
    brand: "Logitech",
    rating: 4.7,
    reviews: 423,
    description: "Mouse inalámbrico de precisión para trabajo y estudios",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop",
    features: ["8K DPI Sensor", "Wireless", "Multi-Device", "Ergonomic Design"],
    inStock: true
  }
];

const categories = ["Todos", "Laptops", "Tablets", "Audífonos", "Grabadores", "Calculadoras", "Accesorios"];

interface ElectronicsProps {
  onAddToCart?: (item: any) => void;
}

const Electronics = ({ onAddToCart }: ElectronicsProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const { t } = useLanguage();

  const filteredElectronics = electronicsData.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todos" || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: any) => {
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
            <h3 className="text-2xl font-bold text-textPrimary mb-2">{electronicsData.length}</h3>
            <p className="text-textPrimary">Productos Disponibles</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg text-center border border-primary">
            <div className="text-secondary mb-2">
              <Star size={32} className="mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-textPrimary mb-2">4.5</h3>
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
              <div className="relative h-48 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <Badge variant="destructive" className="text-lg px-4 py-2">
                      Agotado
                    </Badge>
                  </div>
                )}
                {product.originalPrice > product.price && (
                  <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                    -${(product.originalPrice - product.price).toFixed(0)}
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
                    {product.originalPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                  </div>
                </div>

                {/* Add to Cart Button */}
                <Button
                  onClick={() => handleAddToCart(product)}
                  disabled={!product.inStock}
                  className={`w-full ${
                    product.inStock 
                      ? "bg-green-600 hover:bg-green-700 text-white" 
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <ShoppingCart size={16} className="mr-2" />
                  {product.inStock ? "Agregar al Carrito" : "Agotado"}
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
