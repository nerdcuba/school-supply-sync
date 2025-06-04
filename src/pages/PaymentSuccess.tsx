
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular verificación del pago
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    // Limpiar el carrito del localStorage cuando el pago es exitoso
    if (sessionId) {
      localStorage.removeItem('cartItems');
      // Enviar evento para notificar a otras ventanas que el carrito debe vaciarse
      window.localStorage.setItem('paymentCompleted', Date.now().toString());
      
      toast({
        title: "¡Pago exitoso!",
        description: "Tu pedido ha sido procesado correctamente.",
        variant: "default",
      });
    }

    return () => clearTimeout(timer);
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Verificando tu pago...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-800">
                ¡Pago Exitoso!
              </CardTitle>
              <CardDescription className="text-lg">
                Tu pedido ha sido procesado correctamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Detalles del Pago</h3>
                <div className="space-y-2 text-sm">
                  {sessionId && (
                    <div className="flex justify-between">
                      <span>ID de Sesión:</span>
                      <span className="font-mono text-xs">{sessionId.slice(0, 20)}...</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Estado:</span>
                    <span className="text-green-600 font-semibold">Completado</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Método de Pago:</span>
                    <span>Stripe</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-gray-600">
                  Recibirás un email de confirmación con los detalles de tu pedido.
                  Tu pedido será procesado y enviado pronto.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-sm">
                    💡 <strong>Tip:</strong> Puedes cerrar esta ventana y regresar a la página principal. 
                    Tu carrito se ha vaciado automáticamente.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      window.close();
                      // Si no se puede cerrar la ventana, redirigir
                      setTimeout(() => {
                        window.location.href = '/';
                      }, 1000);
                    }}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Cerrar Ventana
                  </Button>
                  <Link to="/" className="flex-1">
                    <Button variant="outline" className="w-full">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Volver al Inicio
                    </Button>
                  </Link>
                  {user && (
                    <Link to="/dashboard" className="flex-1">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Ver Mis Pedidos
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
