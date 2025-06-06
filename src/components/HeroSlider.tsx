
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { sliderService, SliderImage } from '@/services/sliderService';

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState<SliderImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar slides desde Supabase al iniciar
  useEffect(() => {
    loadSlides();

    // Escuchar cambios en los slides desde el admin
    const handleSlidesUpdate = () => {
      console.log('🔄 Slides actualizados desde admin');
      loadSlides();
    };

    window.addEventListener('slidesUpdated', handleSlidesUpdate);

    return () => {
      window.removeEventListener('slidesUpdated', handleSlidesUpdate);
    };
  }, []);

  const loadSlides = async () => {
    setIsLoading(true);
    try {
      const slidesData = await sliderService.getActiveSlides();
      
      if (slidesData.length === 0) {
        // Si no hay slides en la BD, usar slides por defecto
        loadDefaultSlides();
      } else {
        setSlides(slidesData);
      }
    } catch (error) {
      console.error('Error loading slides:', error);
      loadDefaultSlides();
    } finally {
      setIsLoading(false);
    }
  };

  const loadDefaultSlides = () => {
    const defaultSlides: SliderImage[] = [
      {
        id: '1',
        title_key: 'Listas Oficiales de Útiles Escolares',
        subtitle_key: 'Encuentra las listas oficiales de útiles escolares de todas las escuelas de Costa Rica',
        button_text_key: 'Ver Escuelas',
        button_link: '/schools',
        image_url: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        background_color: '#1E90FF',
        button_style: 'secondary',
        text_alignment: 'center',
        text_position: 'center',
        display_order: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        title_key: 'Compra Conveniente desde Casa',
        subtitle_key: 'Ordena todos los útiles necesarios desde la comodidad de tu hogar',
        button_text_key: 'Explorar Productos',
        button_link: '/schools',
        image_url: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        background_color: '#FF6347',
        button_style: 'accent',
        text_alignment: 'left',
        text_position: 'center',
        display_order: 1,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        title_key: 'Mantente Organizado',
        subtitle_key: 'Registra tus compras y accede a tus listas cuando quieras',
        button_text_key: 'Mi Perfil',
        button_link: '/dashboard',
        image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        background_color: '#FFD700',
        button_style: 'primary',
        text_alignment: 'right',
        text_position: 'center',
        display_order: 2,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    setSlides(defaultSlides);
  };

  useEffect(() => {
    if (slides.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index: number) => setCurrent(index);
  const nextSlide = () => setCurrent((current + 1) % slides.length);
  const prevSlide = () => setCurrent((current - 1 + slides.length) % slides.length);

  const getButtonClass = (style: 'primary' | 'secondary' | 'accent') => {
    switch (style) {
      case 'primary':
        return 'btn-vibrant';
      case 'secondary':
        return 'btn-secondary';
      case 'accent':
        return 'btn-accent';
      default:
        return 'btn-vibrant';
    }
  };

  const getTextAlignmentClass = (alignment: 'left' | 'center' | 'right') => {
    switch (alignment) {
      case 'left':
        return 'text-left md:text-left';
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right md:text-right';
      default:
        return 'text-center';
    }
  };

  const getTextPositionClass = (position: 'top' | 'center' | 'bottom') => {
    switch (position) {
      case 'top':
        return 'justify-start pt-8';
      case 'center':
        return 'justify-center';
      case 'bottom':
        return 'justify-end pb-8';
      default:
        return 'justify-center';
    }
  };

  if (isLoading) {
    return (
      <div className="h-96 md:h-[500px] w-full bg-gray-200 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-900"></div>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="h-96 md:h-[500px] w-full bg-gray-200 flex items-center justify-center">
        <p className="text-gray-500">No hay slides disponibles</p>
      </div>
    );
  }

  return (
    <div className="relative h-96 md:h-[500px] w-full overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === current ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundColor: slide.background_color }}
        >
          {/* Mobile Layout: Image first, then text */}
          <div className="md:hidden flex flex-col h-full">
            {/* Image Container - Mobile (top) */}
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="w-full h-40 max-w-sm rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={slide.image_url} 
                  alt={slide.title_key}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';
                  }}
                />
              </div>
            </div>

            {/* Text Content Container - Mobile (bottom) with padding for indicators */}
            <div className={`flex-1 flex ${getTextPositionClass(slide.text_position)} px-6 pb-6`}>
              <div className={`text-white w-full ${getTextAlignmentClass(slide.text_alignment)}`}>
                <h1 className="text-xl font-bold mb-4 text-white animate-fade-in">
                  {slide.title_key}
                </h1>
                <p className="text-sm mb-6 text-gray-100 animate-fade-in leading-relaxed">
                  {slide.subtitle_key}
                </p>
                {slide.button_text_key && (
                  <Link to={slide.button_link}>
                    <button className={`${getButtonClass(slide.button_style)} animate-fade-in text-sm px-4 py-2`}>
                      {slide.button_text_key}
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Layout: Original side by side layout */}
          <div className="hidden md:flex items-center h-full px-8">
            <div className="container mx-auto flex items-center gap-12">
              {/* Text Content - Desktop */}
              <div className={`flex-1 ${getTextAlignmentClass(slide.text_alignment)}`}>
                <h1 className="text-4xl lg:text-5xl font-bold mb-6 text-white animate-fade-in">
                  {slide.title_key}
                </h1>
                <p className="text-lg lg:text-xl mb-8 text-gray-100 animate-fade-in leading-relaxed">
                  {slide.subtitle_key}
                </p>
                {slide.button_text_key && (
                  <Link to={slide.button_link}>
                    <button className={`${getButtonClass(slide.button_style)} animate-fade-in`}>
                      {slide.button_text_key}
                    </button>
                  </Link>
                )}
              </div>

              {/* Image Container - Desktop */}
              <div className="flex-1 flex items-center justify-center">
                <div className="w-full h-80 max-w-lg rounded-xl overflow-hidden shadow-2xl">
                  <img 
                    src={slide.image_url} 
                    alt={slide.title_key}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all duration-200"
      >
        <ChevronLeft size={24} className="text-white" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all duration-200"
      >
        <ChevronRight size={24} className="text-white" />
      </button>

      {/* Indicators - Positioned differently for mobile vs desktop */}
      <div className="absolute bottom-2 md:bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === current
                ? 'bg-white scale-125'
                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
