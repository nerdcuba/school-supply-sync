
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CreditCard, MapPin, User, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: any[];
  total: number;
  onCheckoutComplete: () => void;
}

const CheckoutModal = ({ isOpen, onClose, items, total, onCheckoutComplete }: CheckoutModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: ""
  });

  const { user, addPurchase } = useAuth();
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // Add purchase to user's history if logged in
      if (user) {
        addPurchase(items, finalTotal);
      }

      toast({
        title: "¡Pedido confirmado!",
        description: `Tu pedido por $${finalTotal.toFixed(2)} ha sido procesado exitosamente.`,
      });

      onCheckoutComplete();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema procesando tu pedido. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard size={20} />
            <span>Finalizar Compra</span>
          </DialogTitle>
          <DialogDescription>
            Completa tu información para procesar el pedido
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <User size={18} />
              <span>Información Personal</span>
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

          {/* Shipping Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <MapPin size={18} />
              <span>Dirección de Entrega</span>
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

          {/* Payment Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <CreditCard size={18} />
              <span>Información de Pago</span>
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nameOnCard">Nombre en la Tarjeta *</Label>
                <Input
                  id="nameOnCard"
                  value={formData.nameOnCard}
                  onChange={(e) => handleInputChange("nameOnCard", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Número de Tarjeta *</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardNumber}
                  onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Fecha de Vencimiento *</Label>
                  <Input
                    id="expiryDate"
                    placeholder="MM/AA"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV *</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={formData.cvv}
                    onChange={(e) => handleInputChange("cvv", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
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
              {isLoading ? "Procesando..." : `Pagar $${finalTotal.toFixed(2)}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
