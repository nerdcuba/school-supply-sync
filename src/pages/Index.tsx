
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, GraduationCap, ShoppingCart, Phone, Mail, MapPin, Users, BookOpen, Star } from "lucide-react";
import SchoolSelector from "@/components/SchoolSelector";
import SupplyList from "@/components/SupplyList";
import ShoppingCartSidebar from "@/components/ShoppingCartSidebar";
import ContactSection from "@/components/ContactSection";

const Index = () => {
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const addToCart = (item: any) => {
    setCartItems(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      if (existing) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-blue-600">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 text-white p-3 rounded-full">
                <GraduationCap size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Plan Ahead Solutions</h1>
                <p className="text-gray-600 text-sm">Simplificando el regreso a clases</p>
              </div>
            </div>
            <Button
              onClick={() => setIsCartOpen(true)}
              variant="outline"
              className="relative border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <ShoppingCart className="mr-2" size={20} />
              Carrito ({cartItems.length})
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {!selectedSchool && (
        <section className="py-16 text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              ¡Prepárate para el nuevo año escolar!
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Encuentra fácilmente todas las listas de útiles escolares organizadas por escuela y grado. 
              Simplificamos tu experiencia de compra para que puedas enfocarte en lo que realmente importa.
            </p>
            
            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <div className="text-blue-600 mb-2">
                  <Users size={32} className="mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">50+</h3>
                <p className="text-gray-600">Escuelas Asociadas</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <div className="text-green-600 mb-2">
                  <BookOpen size={32} className="mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">500+</h3>
                <p className="text-gray-600">Listas de Útiles</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <div className="text-yellow-600 mb-2">
                  <Star size={32} className="mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">4.9</h3>
                <p className="text-gray-600">Calificación Promedio</p>
              </div>
            </div>

            {/* Search */}
            <div className="max-w-xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Buscar escuela..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 py-3 text-lg border-2 border-blue-200 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!selectedSchool ? (
          <SchoolSelector
            onSelectSchool={setSelectedSchool}
            searchTerm={searchTerm}
          />
        ) : (
          <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <button
                onClick={() => {
                  setSelectedSchool(null);
                  setSelectedGrade(null);
                }}
                className="hover:text-blue-600 transition-colors"
              >
                Inicio
              </button>
              <span>/</span>
              <span className="text-gray-900 font-medium">{selectedSchool}</span>
              {selectedGrade && (
                <>
                  <span>/</span>
                  <span className="text-gray-900 font-medium">{selectedGrade}</span>
                </>
              )}
            </div>

            <SupplyList
              school={selectedSchool}
              grade={selectedGrade}
              onSelectGrade={setSelectedGrade}
              onAddToCart={addToCart}
            />
          </div>
        )}
      </main>

      {/* Contact Section */}
      <ContactSection />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-600 text-white p-2 rounded-full">
                  <GraduationCap size={20} />
                </div>
                <h3 className="text-xl font-bold">Plan Ahead Solutions</h3>
              </div>
              <p className="text-gray-400">
                Haciendo que el regreso a clases sea más fácil para las familias.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Inicio</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Escuelas</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Ayuda</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contacto</h4>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center space-x-2">
                  <Mail size={16} />
                  <span>info@planaheadsolutions.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone size={16} />
                  <span>(555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin size={16} />
                  <span>Miami, FL</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Plan Ahead Solutions. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Shopping Cart Sidebar */}
      <ShoppingCartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemoveItem={removeFromCart}
        onUpdateQuantity={updateQuantity}
        total={cartTotal}
      />
    </div>
  );
};

export default Index;
