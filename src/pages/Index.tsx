
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Users, BookOpen, Star, CheckCircle, Clock, DollarSign } from "lucide-react";
import { useState } from "react";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-green-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            ¡Prepárate para el nuevo año escolar!
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Encuentra fácilmente todas las listas de útiles escolares organizadas por escuela y grado. 
            Simplificamos tu experiencia de compra para que puedas enfocarte en lo que realmente importa.
          </p>
          
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

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/schools">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
                Explorar Escuelas
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                Cómo Funciona
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <div className="text-blue-600 mb-2">
                  <Users size={40} className="mx-auto" />
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900">50+</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Escuelas Asociadas</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="text-green-600 mb-2">
                  <BookOpen size={40} className="mx-auto" />
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900">500+</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Listas de Útiles</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="text-yellow-600 mb-2">
                  <Star size={40} className="mx-auto" />
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900">4.9</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Calificación Promedio</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir Plan Ahead Solutions?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hacemos que la compra de útiles escolares sea simple, rápida y conveniente.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="bg-blue-100 text-blue-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <CheckCircle size={24} />
                </div>
                <CardTitle>Listas Verificadas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Todas nuestras listas están verificadas directamente con las escuelas 
                  para garantizar precisión y estar actualizadas.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="bg-green-100 text-green-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Clock size={24} />
                </div>
                <CardTitle>Ahorra Tiempo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Evita las filas y el estrés de las compras de último minuto. 
                  Compra desde la comodidad de tu hogar.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="bg-yellow-100 text-yellow-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <DollarSign size={24} />
                </div>
                <CardTitle>Precios Competitivos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Trabajamos con proveedores de confianza para ofrecerte 
                  los mejores precios en útiles de calidad.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para simplificar tu regreso a clases?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Únete a miles de familias que ya confían en nosotros para sus necesidades escolares.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/schools">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                Comenzar Ahora
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-blue-600">
                Crear Cuenta Gratis
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
