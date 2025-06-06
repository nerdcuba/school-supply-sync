
import HeroSlider from '@/components/HeroSlider';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroSlider />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
