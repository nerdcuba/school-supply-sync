
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Slide {
  titleKey: string;
  subtitleKey: string;
  buttonTextKey: string;
  buttonLink: string;
  bgImage: string;
  buttonStyle: 'primary' | 'secondary' | 'accent';
}

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const { t } = useLanguage();

  const slides: Slide[] = [
    {
      titleKey: 'hero.slide1.title',
      subtitleKey: 'hero.slide1.subtitle',
      buttonTextKey: 'hero.slide1.button',
      buttonLink: '/schools',
      bgImage: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      buttonStyle: 'secondary'
    },
    {
      titleKey: 'hero.slide2.title',
      subtitleKey: 'hero.slide2.subtitle',
      buttonTextKey: 'hero.slide2.button',
      buttonLink: '/schools',
      bgImage: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      buttonStyle: 'accent'
    },
    {
      titleKey: 'hero.slide3.title',
      subtitleKey: 'hero.slide3.subtitle',
      buttonTextKey: 'hero.slide3.button',
      buttonLink: '/dashboard',
      bgImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      buttonStyle: 'primary'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className="relative h-96 md:h-[400px] w-full overflow-hidden bg-gray-900">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${slide.bgImage})` }}
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-40" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex items-center justify-center h-full px-4">
            <div className="text-center text-white max-w-4xl mx-auto">
              <h1 className="text-3xl md:text-5xl font-bold mb-4 text-white animate-fade-in">
                {t(slide.titleKey)}
              </h1>
              <p className="text-lg md:text-xl mb-8 text-gray-200 animate-fade-in">
                {t(slide.subtitleKey)}
              </p>
              <Link to={slide.buttonLink}>
                <button className={`${getButtonClass(slide.buttonStyle)} animate-fade-in`}>
                  {t(slide.buttonTextKey)}
                </button>
              </Link>
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

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === current
                ? 'bg-accent scale-125'
                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
