
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingBag, CreditCard } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  category: string;
}

interface ShoppingCartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  total: number;
  onCheckout: () => void;
}

const ShoppingCartSidebar = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onUpdateQuantity,
  total,
  onCheckout
}: ShoppingCartSidebarProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="flex items-center space-x-2">
            <ShoppingBag size={20} />
            <span>Carrito de Compras</span>
          </SheetTitle>
          <SheetDescription>
            {items.length === 0
              ? "Tu carrito está vacío"
              : `${items.length} artículo${items.length !== 1 ? 's' : ''} en tu carrito`
            }
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col flex-1 min-h-0 mt-6">
          {/* Cart Items - Scrollable */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">Tu carrito está vacío</p>
                <p className="text-sm text-gray-400">
                  Agrega útiles escolares a tu carrito para comenzar
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 line-clamp-2 break-words">{item.name}</h4>
                      <p className="text-sm text-gray-600">{item.brand}</p>
                      <Badge variant="secondary" className="mt-1">
                        {item.category}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0 ml-2"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={14} />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus size={14} />
                      </Button>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">${item.price.toFixed(2)} c/u</p>
                      <p className="font-semibold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Summary - Fixed at bottom */}
          {items.length > 0 && (
            <div className="border-t pt-4 mt-4 space-y-4 flex-shrink-0">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Impuestos estimados:</span>
                  <span>${(total * 0.0875).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>${(total * 1.0875).toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={onCheckout}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <CreditCard size={16} className="mr-2" />
                  Proceder al Checkout
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  Proceso de compra seguro y protegido
                </p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ShoppingCartSidebar;
