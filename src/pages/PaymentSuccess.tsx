
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError('No se encontró ID de sesión de pago');
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Verificando pago con session ID:', sessionId);

        // Llamar a la función de verificación de pago
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { sessionId }
        });

        if (error) {
          console.error('❌ Error verificando pago:', error);
          throw new Error(error.message || 'Error verificando el pago');
        }

        if (data?.paid) {
          console.log('✅ Pago verificado exitosamente');
          setPaymentVerified(true);
          
          // Limpiar carrito después de pago exitoso
          localStorage.removeItem('cartItems');
          localStorage.setItem('paymentCompleted', Date.now().toString());
          
          toast({
            title: "¡Pago exitoso!",
            description: "Tu pedido ha sido procesado y confirmado correctamente.",
            variant: "default",
          });
        } else {
          console.log('❌ Pago no confirmado:', data?.status);
          setError(`El pago no pudo ser confirmado. Estado: ${data?.status || 'desconocido'}`);
        }
      } catch (error: any) {
        console.error('❌ Error en verificación:', error);
        setError(error.message || 'Error verificando el pago');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <CardTitle className="text-2xl text-red-800">
                  Error en el Pago
                </CardTitle>
                <CardDescription className="text-lg">
                  {error}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Por favor, contacta con soporte si el problema persiste.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link to="/" className="flex-1">
                      <Button variant="outline" className="w-full">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver al Inicio
                      </Button>
                    </Link>
                    <Link to="/contact" className="flex-1">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        Contactar Soporte
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!paymentVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-yellow-600" />
                </div>
                <CardTitle className="text-2xl text-yellow-800">
                  Pago Pendiente
                </CardTitle>
                <CardDescription className="text-lg">
                  Tu pago está siendo procesado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-600">
                  Tu pago no ha sido confirmado aún. Por favor, verifica tu método de pago.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/" className="flex-1">
                    <Button variant="outline" className="w-full">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Volver al Inicio
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
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
                Tu pedido ha sido procesado y confirmado correctamente
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
                    <span className="text-green-600 font-semibold">Completado y Confirmado</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-gray-600">
                  Tu carrito se ha vaciado automáticamente. Recibirás un email de confirmación pronto.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => window.close()}
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
