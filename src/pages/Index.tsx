
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSlider from '@/components/HeroSlider';
import ContactSection from '@/components/ContactSection';

const Index = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleOpenCart = () => {
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        cartItemsCount={cartItems.length} 
        onOpenCart={handleOpenCart} 
      />
      
      <main>
        <HeroSlider />
        <ContactSection />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
