import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { user, addPurchase } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orderProcessed, setOrderProcessed] = useState(false);

  const processPaymentSuccess = useCallback(async () => {
    console.log('🎉 Processing payment success for session:', sessionId);
    
    if (!sessionId) {
      setLoading(false);
      return;
    }

    try {
      // Limpiar el carrito del localStorage
      localStorage.removeItem('cartItems');
      // Enviar evento para notificar a otras ventanas que el carrito debe vaciarse
      window.localStorage.setItem('paymentCompleted', Date.now().toString());

      // Si hay usuario autenticado, actualizar la orden en la base de datos
      if (user && !orderProcessed) {
        console.log('👤 Updating order status for user:', user.email);
        
        // Buscar la orden con este session_id
        const { data: orders, error: fetchError } = await supabase
          .from('orders')
          .select('*')
          .eq('stripe_session_id', sessionId)
          .eq('user_id', user.id);

        if (fetchError) {
          console.error('❌ Error fetching order:', fetchError);
        } else if (orders && orders.length > 0) {
          const order = orders[0];
          console.log('📋 Found order to update:', order.id);

          // Actualizar el estado de la orden a 'completed'
          const { error: updateError } = await supabase
            .from('orders')
            .update({ 
              status: 'completed',
              updated_at: new Date().toISOString()
            })
            .eq('id', order.id);

          if (updateError) {
            console.error('❌ Error updating order:', updateError);
          } else {
            console.log('✅ Order status updated to completed');
            setOrderProcessed(true);
            
            // Agregar la compra al contexto (esto recargará las órdenes del usuario)
            try {
              // Asegurar que order.items es un array antes de pasarlo
              const orderItems = Array.isArray(order.items) ? order.items : [];
              if (addPurchase && typeof addPurchase === 'function') {
                await addPurchase(orderItems, order.total);
                console.log('✅ Purchase added to user context');
              }
            } catch (purchaseError) {
              console.error('❌ Error adding purchase to context:', purchaseError);
            }
          }
        } else {
          console.log('⚠️ No order found for this session');
        }
      }

      toast({
        title: "¡Pago exitoso!",
        description: "Tu pedido ha sido procesado correctamente.",
        variant: "default",
      });

    } catch (error) {
      console.error('❌ Error processing payment success:', error);
    }

    setLoading(false);
  }, [sessionId, user, addPurchase, orderProcessed]);

  useEffect(() => {
    // Simular verificación del pago
    const timer = setTimeout(() => {
      processPaymentSuccess();
    }, 2000);

    return () => clearTimeout(timer);
  }, [processPaymentSuccess]);

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
