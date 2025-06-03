
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AdminProvider } from "@/contexts/AdminContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShoppingCartSidebar from "@/components/ShoppingCartSidebar";
import CheckoutModal from "@/components/CheckoutModal";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Schools from "./pages/Schools";
import SchoolDetails from "./pages/SchoolDetails";
import Electronics from "./pages/Electronics";
import HowItWorks from "./pages/HowItWorks";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient();

const App = () => {
  console.log('🚀 App component renderizando');
  
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const addToCart = (item: any) => {
    setCartItems(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      if (existing) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleCheckoutComplete = () => {
    setCartItems([]);
    setIsCartOpen(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <AuthProvider>
            <AdminProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <div className="min-h-screen flex flex-col">
                  {/* Navbar solo en rutas que no son de administrador */}
                  <Routes>
                    <Route path="/admin/*" element={null} />
                    <Route path="*" element={
                      <Navbar 
                        cartItemsCount={cartItems.length}
                        onOpenCart={() => setIsCartOpen(true)}
                      />
                    } />
                  </Routes>
                  
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/schools" element={<Schools />} />
                      <Route path="/school/:schoolId" element={<SchoolDetails onAddToCart={addToCart} />} />
                      <Route path="/electronics" element={<Electronics onAddToCart={addToCart} />} />
                      <Route path="/how-it-works" element={<HowItWorks />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route 
                        path="/dashboard" 
                        element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        } 
                      />
                      
                      {/* Rutas de administración */}
                      <Route path="/admin/login" element={<AdminLogin />} />
                      <Route path="/admin/dashboard" element={<AdminDashboard />} />
                      
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>

                  {/* Footer solo en rutas que no son de administrador */}
                  <Routes>
                    <Route path="/admin/*" element={null} />
                    <Route path="*" element={<Footer />} />
                  </Routes>

                  <ShoppingCartSidebar
                    isOpen={isCartOpen}
                    onClose={() => setIsCartOpen(false)}
                    items={cartItems}
                    onRemoveItem={removeFromCart}
                    onUpdateQuantity={updateQuantity}
                    total={cartTotal}
                    onCheckout={() => {
                      setIsCartOpen(false);
                      setIsCheckoutOpen(true);
                    }}
                  />

                  <CheckoutModal
                    isOpen={isCheckoutOpen}
                    onClose={() => setIsCheckoutOpen(false)}
                    items={cartItems}
                    total={cartTotal}
                    onCheckoutComplete={handleCheckoutComplete}
                  />
                </div>
              </BrowserRouter>
            </AdminProvider>
          </AuthProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
