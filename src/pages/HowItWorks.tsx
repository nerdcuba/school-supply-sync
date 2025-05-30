
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, ShoppingCart, CreditCard, Truck, CheckCircle, Users } from "lucide-react";
import { Link } from "react-router-dom";

const HowItWorks = () => {
  const steps = [
    {
      icon: Search,
      title: "1. Busca tu Escuela",
      description: "Encuentra fácilmente tu escuela en nuestro directorio organizado por distrito y ubicación.",
      details: "Tenemos más de 50 escuelas disponibles en Miami-Dade, con listas actualizadas para cada año escolar."
    },
    {
      icon: ShoppingCart,
      title: "2. Selecciona el Grado",
      description: "Elige el grado de tu hijo/a para ver la lista específica de útiles escolares requeridos.",
      details: "Cada lista está verificada por la escuela y organizada por categorías para facilitar tu compra."
    },
    {
      icon: CreditCard,
      title: "3. Añade al Carrito",
      description: "Agrega los útiles necesarios a tu carrito con un solo clic. Ajusta cantidades según necesites.",
      details: "Precios competitivos y productos de marcas recomendadas por los maestros."
    },
    {
      icon: Truck,
      title: "4. Proceso de Compra",
      description: "Completa tu pedido de forma segura y recibe los útiles en la comodidad de tu hogar.",
      details: "Múltiples opciones de entrega y pago para tu conveniencia."
    }
  ];

  const benefits = [
    {
      icon: CheckCircle,
      title: "Listas Verificadas",
      description: "Todas nuestras listas están verificadas directamente con las escuelas para garantizar precisión."
    },
    {
      icon: Users,
      title: "Ahorro de Tiempo",
      description: "Evita las filas y el estrés de las compras de último minuto. Compra desde casa."
    },
    {
      icon: CreditCard,
      title: "Precios Competitivos",
      description: "Trabajamos con proveedores de confianza para ofrecerte los mejores precios."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ¿Cómo Funciona Plan Ahead Solutions?
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Simplificamos la compra de útiles escolares en 4 pasos sencillos. 
            Desde la búsqueda hasta la entrega, hacemos que el regreso a clases sea fácil y sin estrés.
          </p>
        </div>

        {/* Steps Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Proceso Paso a Paso
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {steps.map((step, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="bg-blue-600 text-white p-3 rounded-full">
                      <step.icon size={24} />
                    </div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-3 font-medium">
                    {step.description}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {step.details}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            ¿Por Qué Elegir Plan Ahead Solutions?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="bg-green-100 text-green-600 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                    <benefit.icon size={24} />
                  </div>
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Preguntas Frecuentes
          </h2>
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">¿Las listas están actualizadas?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Sí, trabajamos directamente con las escuelas para mantener todas las listas 
                  actualizadas antes del inicio de cada año escolar.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">¿Qué métodos de pago aceptan?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Aceptamos todas las tarjetas de crédito principales, PayPal, y transferencias bancarias.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">¿Hacen entregas a domicilio?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Sí, ofrecemos entrega gratuita para pedidos superiores a $50 en el área de Miami-Dade.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">¿Puedo modificar mi pedido después de realizarlo?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Puedes modificar tu pedido dentro de las primeras 2 horas después de realizarlo. 
                  Después de ese tiempo, contáctanos y haremos nuestro mejor esfuerzo para ayudarte.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-lg p-8 shadow-lg text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¿Listo para Comenzar?
          </h2>
          <p className="text-gray-600 mb-6">
            Únete a miles de familias que ya simplificaron su regreso a clases con nosotros.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/schools">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Buscar Mi Escuela
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline">
                Crear Cuenta Gratis
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
