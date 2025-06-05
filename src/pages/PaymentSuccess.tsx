
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, ArrowLeft, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PaymentSuccessProps {
  onClearCart?: () => void;
}

const PaymentSuccess = ({ onClearCart }: PaymentSuccessProps) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [hasProcessed, setHasProcessed] = useState(false);

  const clearCartOnce = () => {
    if (hasProcessed) return;
    
    console.log('🧹 Limpiando carrito después del pago exitoso...');
    
    try {
      if (onClearCart) {
        onClearCart();
      }
      
      localStorage.removeItem('cartItems');
      localStorage.setItem('cartItems', '[]');
      window.dispatchEvent(new CustomEvent('cartCleared'));
      
      setHasProcessed(true);
      console.log('✅ Carrito limpiado exitosamente');
    } catch (error) {
      console.error('❌ Error limpiando carrito:', error);
    }
  };

  useEffect(() => {
    // Evitar múltiples ejecuciones
    if (hasProcessed) return;

    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');
      
      if (!sessionId) {
        console.error('❌ No session ID found in URL');
        toast({
          title: "Error",
          description: "No se encontró información de la sesión de pago",
          variant: "destructive",
        });
        setVerifying(false);
        return;
      }

      // Verificar si ya se procesó esta sesión
      const processedKey = `payment_processed_${sessionId}`;
      if (localStorage.getItem(processedKey)) {
        console.log('🔄 Pago ya procesado anteriormente para esta sesión');
        setVerifying(false);
        setHasProcessed(true);
        return;
      }

      try {
        console.log('🔍 Verificando pago con session ID:', sessionId);
        
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { sessionId }
        });

        if (error) {
          console.error('❌ Error verifying payment:', error);
          throw error;
        }

        console.log('✅ Payment verification response:', data);

        if (data.success && data.paid) {
          setOrderDetails(data.order);
          clearCartOnce();
          
          // Marcar como procesado
          localStorage.setItem(processedKey, 'true');
          
          toast({
            title: "¡Pago Exitoso!",
            description: "Tu orden ha sido procesada correctamente.",
            variant: "default",
          });
        } else {
          throw new Error('Payment not confirmed');
        }
      } catch (error) {
        console.error('❌ Error in payment verification:', error);
        toast({
          title: "Error en la verificación",
          description: "Hubo un problema verificando tu pago. Contacta al soporte si el cargo se realizó.",
          variant: "destructive",
        });
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, onClearCart, hasProcessed]);

  if (verifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Verificando tu pago...
              </h2>
              <p className="text-gray-600">
                Por favor espera mientras confirmamos tu transacción
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                ¡Pago Exitoso!
              </CardTitle>
              <CardDescription className="text-lg">
                Tu pedido ha sido procesado correctamente
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {orderDetails && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Detalles de tu Orden
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID de Orden:</span>
                      <span className="font-mono text-sm">{orderDetails.id}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Pagado:</span>
                      <span className="font-semibold text-green-600">
                        ${orderDetails.total?.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estado:</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        Pendiente
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha:</span>
                      <span className="text-sm">
                        {new Date(orderDetails.created_at).toLocaleDateString('es-MX')}
                      </span>
                    </div>

                    {orderDetails.items && orderDetails.items.length > 0 && (
                      <div className="border-t pt-3 mt-3">
                        <span className="text-gray-600 font-medium">Artículos:</span>
                        <ul className="mt-2 space-y-1">
                          {orderDetails.items.map((item: any, index: number) => (
                            <li key={index} className="text-sm text-gray-700 flex justify-between">
                              <span>{item.name} x {item.quantity}</span>
                              <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">¿Qué sigue?</h4>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Recibirás un email de confirmación pronto</li>
                  <li>• Tu orden será procesada y preparada para envío</li>
                  <li>• Te notificaremos cuando tu pedido esté en camino</li>
                  <li>• Puedes revisar el estado de tu orden en tu dashboard</li>
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Ver Mis Órdenes
                </Button>
                
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al Inicio
                </Button>
              </div>
              
              <div className="text-center">
                <Button
                  onClick={() => navigate('/schools')}
                  variant="ghost"
                  className="text-purple-600 hover:text-purple-700"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Continuar Comprando
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
