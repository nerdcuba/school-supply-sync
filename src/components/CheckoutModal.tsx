import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { CreditCard, MapPin, User, LogIn, Truck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: any[];
  total: number;
  onCheckoutComplete: () => void;
}

const CheckoutModal = ({ isOpen, onClose, items, total, onCheckoutComplete }: CheckoutModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [sameAsDelivery, setSameAsDelivery] = useState(false);
  const [formData, setFormData] = useState({
    // Información personal y de billing
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    // Información de delivery
    deliveryName: "",
    deliveryAddress: "",
    deliveryCity: "",
    deliveryZipCode: ""
  });

  const { user } = useAuth();
  const finalTotal = total * 1.0875; // Including taxes

  // Si no hay usuario autenticado, mostrar mensaje para iniciar sesión
  if (!user) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <LogIn size={20} />
              <span>Iniciar Sesión Requerido</span>
            </DialogTitle>
            <DialogDescription>
              Debes iniciar sesión para proceder con el checkout
            </DialogDescription>
          </DialogHeader>

          <div className="text-center py-6">
            <LogIn size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Autenticación Requerida
            </h3>
            <p className="text-gray-600 mb-6">
              Para completar tu compra, necesitas tener una cuenta e iniciar sesión. 
              Esto nos permite procesar tu pedido de manera segura y mantener un historial de tus compras.
            </p>
            
            <div className="space-y-3">
              <Link to="/login" onClick={onClose}>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link to="/register" onClick={onClose}>
                <Button variant="outline" className="w-full">
                  Crear Cuenta Nueva
                </Button>
              </Link>
            </div>
          </div>

          <div className="border-t pt-4">
            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full"
            >
              Volver al Carrito
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Función para extraer información de escuela y grado de los items
  const getSchoolAndGradeFromItems = () => {
    console.log('🔍 Extrayendo escuela y grado de los items:', items);
    
    if (items && items.length > 0) {
      for (const item of items) {
        console.log('📦 Analizando item:', item);
        
        // Buscar escuela y grado en campos directos
        if (item.school && item.grade) {
          console.log('✅ Encontrados en campos directos:', { school: item.school, grade: item.grade });
          return { school: item.school, grade: item.grade };
        }
        
        // Buscar en customerInfo si existe
        if (item.customerInfo?.school && item.customerInfo?.grade) {
          console.log('✅ Encontrados en customerInfo:', { school: item.customerInfo.school, grade: item.customerInfo.grade });
          return { school: item.customerInfo.school, grade: item.customerInfo.grade };
        }
        
        // Intentar extraer del nombre del item
        if (item.name && typeof item.name === 'string') {
          console.log('🔍 Intentando extraer del nombre:', item.name);
          
          // Patrones para detectar grado
          const gradePatterns = [
            /\b(K-\d+|\d+st|\d+nd|\d+rd|\d+th|Grade\s+\d+|Grado\s+\d+)\b/i,
            /\bK\b/i
          ];
          
          let extractedGrade = '';
          let extractedSchool = '';
          
          // Buscar grado
          for (const pattern of gradePatterns) {
            const match = item.name.match(pattern);
            if (match) {
              extractedGrade = match[0];
              console.log('📚 Grado extraído del nombre:', extractedGrade);
              break;
            }
          }
          
          // Buscar escuela (asumiendo formato "Pack - Grado - Escuela")
          if (item.name.includes(' - ')) {
            const parts = item.name.split(' - ');
            console.log('🔍 Partes del nombre:', parts);
            
            // Buscar la parte que parece ser la escuela (no es grado ni "Pack")
            for (let i = 1; i < parts.length; i++) {
              const part = parts[i].trim();
              if (!part.match(/^(Pack|K|K-\d+|\d+(st|nd|rd|th)|Grade\s+\d+|Grado\s+\d+)$/i)) {
                extractedSchool = part;
                console.log('🏫 Escuela extraída del nombre:', extractedSchool);
                break;
              }
            }
          }
          
          if (extractedSchool || extractedGrade) {
            console.log('✅ Extraídos del nombre:', { school: extractedSchool, grade: extractedGrade });
            return { 
              school: extractedSchool || 'N/A', 
              grade: extractedGrade || 'N/A' 
            };
          }
        }
      }
    }
    
    console.log('❌ No se pudo extraer escuela y grado');
    return { school: '', grade: '' };
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSameAsDeliveryChange = (checked: boolean) => {
    setSameAsDelivery(checked);
    if (checked) {
      // Copy billing info to delivery
      setFormData(prev => ({
        ...prev,
        deliveryName: prev.fullName,
        deliveryAddress: prev.address,
        deliveryCity: prev.city,
        deliveryZipCode: prev.zipCode
      }));
    } else {
      // Clear delivery info
      setFormData(prev => ({
        ...prev,
        deliveryName: "",
        deliveryAddress: "",
        deliveryCity: "",
        deliveryZipCode: ""
      }));
    }
  };

  const handleStripeCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('🚀 Starting Stripe checkout process');
      
      // Validate required fields
      const requiredFields = [
        'fullName', 'email', 'phone', 'address', 'city', 'zipCode'
      ];
      const deliveryFields = sameAsDelivery ? [] : [
        'deliveryName', 'deliveryAddress', 'deliveryCity', 'deliveryZipCode'
      ];
      
      const allRequiredFields = [...requiredFields, ...deliveryFields];
      const missingFields = allRequiredFields.filter(field => !formData[field as keyof typeof formData]);
      
      if (missingFields.length > 0) {
        toast({
          title: "Error",
          description: "Por favor completa todos los campos requeridos.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Extraer información de escuela y grado
      const { school, grade } = getSchoolAndGradeFromItems();
      console.log('🏫📚 Información extraída:', { school, grade });

      // Prepare items with customer information embedded
      const itemsWithCustomerInfo = items.map(item => ({
        ...item,
        // Información de facturación
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        zipCode: formData.zipCode,
        // Información de entrega
        deliveryName: sameAsDelivery ? formData.fullName : formData.deliveryName,
        deliveryAddress: sameAsDelivery ? formData.address : formData.deliveryAddress,
        deliveryCity: sameAsDelivery ? formData.city : formData.deliveryCity,
        deliveryZipCode: sameAsDelivery ? formData.zipCode : formData.deliveryZipCode,
        sameAsDelivery: sameAsDelivery,
        // Información completa del cliente para referencias cruzadas
        customerInfo: {
          billing: {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            zipCode: formData.zipCode
          },
          delivery: {
            deliveryName: sameAsDelivery ? formData.fullName : formData.deliveryName,
            deliveryAddress: sameAsDelivery ? formData.address : formData.deliveryAddress,
            deliveryCity: sameAsDelivery ? formData.city : formData.deliveryCity,
            deliveryZipCode: sameAsDelivery ? formData.zipCode : formData.deliveryZipCode,
            sameAsBilling: sameAsDelivery
          },
          // AGREGAR INFORMACIÓN DE ESCUELA Y GRADO
          school: school,
          grade: grade
        }
      }));

      // Prepare customer data
      const customerData = {
        ...formData,
        sameAsDelivery
      };

      console.log('📋 Sending items with customer info:', itemsWithCustomerInfo);
      console.log('🏫📚 Sending school and grade:', { school, grade });

      // Call the Stripe payment function CON INFORMACIÓN DE ESCUELA Y GRADO
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          items: itemsWithCustomerInfo,
          total: finalTotal,
          customerInfo: customerData,
          // ENVIAR EXPLÍCITAMENTE ESCUELA Y GRADO
          school: school,
          grade: grade,
          customerEmail: formData.email,
          itemsCount: items.length
        }
      });

      if (error) {
        console.error('❌ Error calling create-payment function:', error);
        throw new Error(error.message || 'Error procesando el pago');
      }

      if (!data?.url) {
        throw new Error('No se recibió URL de pago de Stripe');
      }

      console.log('✅ Stripe session created successfully:', data.sessionId);

      // Cerrar el modal primero
      onClose();

      // Mostrar toast
      toast({
        title: "Redirigiendo a Stripe",
        description: "Serás redirigido al checkout de Stripe.",
        variant: "default",
      });

      // Asegurar que Stripe se abra en el top level window
      if (window.top) {
        window.top.location.href = data.url;
      } else {
        // Fallback si no hay window.top
        window.location.href = data.url;
      }

    } catch (error: any) {
      console.error('❌ Checkout error:', error);
      toast({
        title: "Error",
        description: error.message || "Hubo un problema procesando tu pedido. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard size={20} />
            <span>Finalizar Compra</span>
          </DialogTitle>
          <DialogDescription>
            Completa tu información para proceder al pago con Stripe
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleStripeCheckout} className="space-y-6">
          {/* Personal Information & Billing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <User size={18} />
              <span>Información Personal y de Facturación</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre Completo *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Billing Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <MapPin size={18} />
              <span>Dirección de Facturación</span>
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Dirección *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Código Postal *</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange("zipCode", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sameAsDelivery"
                checked={sameAsDelivery}
                onCheckedChange={handleSameAsDeliveryChange}
              />
              <Label htmlFor="sameAsDelivery" className="text-sm font-medium">
                La dirección de entrega es la misma que la de facturación
              </Label>
            </div>

            {!sameAsDelivery && (
              <>
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <Truck size={18} />
                  <span>Dirección de Entrega</span>
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="deliveryName">Nombre del Destinatario *</Label>
                    <Input
                      id="deliveryName"
                      value={formData.deliveryName}
                      onChange={(e) => handleInputChange("deliveryName", e.target.value)}
                      required={!sameAsDelivery}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryAddress">Dirección de Entrega *</Label>
                    <Input
                      id="deliveryAddress"
                      value={formData.deliveryAddress}
                      onChange={(e) => handleInputChange("deliveryAddress", e.target.value)}
                      required={!sameAsDelivery}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="deliveryCity">Ciudad *</Label>
                      <Input
                        id="deliveryCity"
                        value={formData.deliveryCity}
                        onChange={(e) => handleInputChange("deliveryCity", e.target.value)}
                        required={!sameAsDelivery}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deliveryZipCode">Código Postal *</Label>
                      <Input
                        id="deliveryZipCode"
                        value={formData.deliveryZipCode}
                        onChange={(e) => handleInputChange("deliveryZipCode", e.target.value)}
                        required={!sameAsDelivery}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold">Resumen del Pedido</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal ({items.length} artículos):</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Impuestos (8.75%):</span>
                <span>${(total * 0.0875).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío:</span>
                <span className="text-green-600">GRATIS</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? "Procesando..." : `Pagar con Stripe $${finalTotal.toFixed(2)}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
