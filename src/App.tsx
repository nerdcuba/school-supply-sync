
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AdminProvider } from "./contexts/AdminContext";
import { AuthProvider } from "./hooks/useAuth";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ShoppingCartSidebar from "./components/ShoppingCartSidebar";
import CheckoutModal from "./components/CheckoutModal";
import Index from "./pages/Index";
import Schools from "./pages/Schools";
import SchoolDetails from "./pages/SchoolDetails";
import Electronics from "./pages/Electronics";
import HowItWorks from "./pages/HowItWorks";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCanceled from "./pages/PaymentCanceled";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Cargar carrito del localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Función simple para limpiar el carrito
  const clearCart = () => {
    console.log('🧹 Limpiando carrito...');
    setCartItems([]);
    localStorage.removeItem('cartItems');
    localStorage.setItem('cartItems', '[]');
    console.log('✅ Carrito limpiado exitosamente');
  };

  // Escuchar evento de carrito limpiado
  useEffect(() => {
    const handleCartCleared = () => {
      console.log('🔔 Evento de carrito limpiado detectado');
      clearCart();
      setIsCartOpen(false);
      setIsCheckoutOpen(false);
    };

    window.addEventListener('cartCleared', handleCartCleared);

    return () => {
      window.removeEventListener('cartCleared', handleCartCleared);
    };
  }, []);

  const handleAddToCart = (item: any) => {
    setCartItems(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(itemId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const handleClearCart = () => {
    clearCart();
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    console.log('Proceeding to checkout with items:', cartItems);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutComplete = () => {
    clearCart();
    setIsCheckoutOpen(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <AdminProvider>
            <AuthProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <div className="min-h-screen flex flex-col">
                  <Navbar 
                    cartItemsCount={cartItems.length}
                    onOpenCart={() => setIsCartOpen(true)}
                  />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/schools" element={<Schools />} />
                      <Route path="/school/:id" element={<SchoolDetails onAddToCart={handleAddToCart} />} />
                      <Route path="/electronics" element={<Electronics onAddToCart={handleAddToCart} />} />
                      <Route path="/how-it-works" element={<HowItWorks />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/payment-success" element={<PaymentSuccess onClearCart={clearCart} />} />
                      <Route path="/payment-canceled" element={<PaymentCanceled />} />
                      <Route 
                        path="/dashboard" 
                        element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        } 
                      />
                      <Route path="/admin/login" element={<AdminLogin />} />
                      <Route path="/admin/dashboard" element={<AdminDashboard />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <Footer />
                  <ShoppingCartSidebar
                    isOpen={isCartOpen}
                    onClose={() => setIsCartOpen(false)}
                    items={cartItems}
                    onRemoveItem={handleRemoveFromCart}
                    onUpdateQuantity={handleUpdateQuantity}
                    total={calculateTotal()}
                    onCheckout={handleCheckout}
                  />
                  <CheckoutModal
                    isOpen={isCheckoutOpen}
                    onClose={() => setIsCheckoutOpen(false)}
                    items={cartItems}
                    total={calculateTotal()}
                    onCheckoutComplete={handleCheckoutComplete}
                  />
                </div>
              </BrowserRouter>
            </AuthProvider>
          </AdminProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
