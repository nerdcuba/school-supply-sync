
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Save, X, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Slide {
  id: string;
  titleKey: string;
  subtitleKey: string;
  buttonTextKey: string;
  buttonLink: string;
  bgImage: string;
  buttonStyle: 'primary' | 'secondary' | 'accent';
}

const SliderManagement = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  // Cargar slides desde localStorage al iniciar
  useEffect(() => {
    const savedSlides = localStorage.getItem('heroSlides');
    if (savedSlides) {
      try {
        setSlides(JSON.parse(savedSlides));
      } catch (error) {
        console.error('Error loading slides:', error);
        // Si hay error, usar slides por defecto
        loadDefaultSlides();
      }
    } else {
      loadDefaultSlides();
    }
  }, []);

  const loadDefaultSlides = () => {
    const defaultSlides: Slide[] = [
      {
        id: '1',
        titleKey: 'hero.slide1.title',
        subtitleKey: 'hero.slide1.subtitle',
        buttonTextKey: 'hero.slide1.button',
        buttonLink: '/schools',
        bgImage: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        buttonStyle: 'secondary'
      },
      {
        id: '2',
        titleKey: 'hero.slide2.title',
        subtitleKey: 'hero.slide2.subtitle',
        buttonTextKey: 'hero.slide2.button',
        buttonLink: '/schools',
        bgImage: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        buttonStyle: 'accent'
      },
      {
        id: '3',
        titleKey: 'hero.slide3.title',
        subtitleKey: 'hero.slide3.subtitle',
        buttonTextKey: 'hero.slide3.button',
        buttonLink: '/dashboard',
        bgImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        buttonStyle: 'primary'
      }
    ];
    setSlides(defaultSlides);
    saveSlides(defaultSlides);
  };

  const saveSlides = (slidesToSave: Slide[]) => {
    localStorage.setItem('heroSlides', JSON.stringify(slidesToSave));
    // Disparar evento para actualizar el slider en tiempo real
    window.dispatchEvent(new CustomEvent('slidesUpdated', { detail: slidesToSave }));
  };

  const handleCreateSlide = () => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      titleKey: '',
      subtitleKey: '',
      buttonTextKey: '',
      buttonLink: '/',
      bgImage: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      buttonStyle: 'primary'
    };
    setEditingSlide(newSlide);
    setIsCreating(true);
  };

  const handleEditSlide = (slide: Slide) => {
    setEditingSlide({ ...slide });
    setIsCreating(false);
  };

  const handleSaveSlide = () => {
    if (!editingSlide) return;

    if (!editingSlide.titleKey.trim() || !editingSlide.subtitleKey.trim()) {
      toast({
        title: "Error",
        description: "El título y subtítulo son requeridos",
        variant: "destructive"
      });
      return;
    }

    let updatedSlides;
    if (isCreating) {
      updatedSlides = [...slides, editingSlide];
    } else {
      updatedSlides = slides.map(slide => 
        slide.id === editingSlide.id ? editingSlide : slide
      );
    }

    setSlides(updatedSlides);
    saveSlides(updatedSlides);
    setEditingSlide(null);
    setIsCreating(false);

    toast({
      title: "Éxito",
      description: isCreating ? "Slide creado exitosamente" : "Slide actualizado exitosamente"
    });
  };

  const handleDeleteSlide = (slideId: string) => {
    if (slides.length <= 1) {
      toast({
        title: "Error",
        description: "Debe haber al menos un slide",
        variant: "destructive"
      });
      return;
    }

    const updatedSlides = slides.filter(slide => slide.id !== slideId);
    setSlides(updatedSlides);
    saveSlides(updatedSlides);

    toast({
      title: "Éxito",
      description: "Slide eliminado exitosamente"
    });
  };

  const handleCancel = () => {
    setEditingSlide(null);
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Slides del Hero</h2>
        <Button onClick={handleCreateSlide} className="bg-purple-600 hover:bg-purple-700">
          <Plus size={16} className="mr-2" />
          Nuevo Slide
        </Button>
      </div>

      {/* Formulario de edición */}
      {editingSlide && (
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="text-lg">
              {isCreating ? 'Crear Nuevo Slide' : 'Editar Slide'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={editingSlide.titleKey}
                  onChange={(e) => setEditingSlide({
                    ...editingSlide,
                    titleKey: e.target.value
                  })}
                  placeholder="Ej: Listas Oficiales de Útiles Escolares"
                />
              </div>
              
              <div>
                <Label htmlFor="buttonText">Texto del Botón</Label>
                <Input
                  id="buttonText"
                  value={editingSlide.buttonTextKey}
                  onChange={(e) => setEditingSlide({
                    ...editingSlide,
                    buttonTextKey: e.target.value
                  })}
                  placeholder="Ej: Ver Escuelas"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="subtitle">Subtítulo *</Label>
              <Textarea
                id="subtitle"
                value={editingSlide.subtitleKey}
                onChange={(e) => setEditingSlide({
                  ...editingSlide,
                  subtitleKey: e.target.value
                })}
                placeholder="Ej: Encuentra las listas oficiales de útiles escolares de todas las escuelas de Costa Rica"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="buttonLink">Enlace del Botón</Label>
                <Input
                  id="buttonLink"
                  value={editingSlide.buttonLink}
                  onChange={(e) => setEditingSlide({
                    ...editingSlide,
                    buttonLink: e.target.value
                  })}
                  placeholder="Ej: /schools"
                />
              </div>

              <div>
                <Label htmlFor="buttonStyle">Estilo del Botón</Label>
                <Select
                  value={editingSlide.buttonStyle}
                  onValueChange={(value: 'primary' | 'secondary' | 'accent') => 
                    setEditingSlide({
                      ...editingSlide,
                      buttonStyle: value
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primario (Azul)</SelectItem>
                    <SelectItem value="secondary">Secundario (Verde)</SelectItem>
                    <SelectItem value="accent">Acento (Naranja)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="bgImage">URL de la Imagen de Fondo</Label>
              <Input
                id="bgImage"
                value={editingSlide.bgImage}
                onChange={(e) => setEditingSlide({
                  ...editingSlide,
                  bgImage: e.target.value
                })}
                placeholder="https://images.unsplash.com/..."
              />
              {editingSlide.bgImage && (
                <div className="mt-2">
                  <img 
                    src={editingSlide.bgImage} 
                    alt="Preview" 
                    className="w-full h-32 object-cover rounded-md"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveSlide} className="bg-green-600 hover:bg-green-700">
                <Save size={16} className="mr-2" />
                Guardar
              </Button>
              <Button onClick={handleCancel} variant="outline">
                <X size={16} className="mr-2" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de slides existentes */}
      <div className="grid gap-4">
        {slides.map((slide, index) => (
          <Card key={slide.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-12 bg-gray-200 rounded overflow-hidden">
                    <img 
                      src={slide.bgImage} 
                      alt={`Slide ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {slide.titleKey || `Slide ${index + 1}`}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {slide.subtitleKey}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded text-xs ${
                        slide.buttonStyle === 'primary' ? 'bg-blue-100 text-blue-800' :
                        slide.buttonStyle === 'secondary' ? 'bg-green-100 text-green-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {slide.buttonStyle}
                      </span>
                      <span className="text-xs text-gray-500">→ {slide.buttonLink}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEditSlide(slide)}
                    variant="outline"
                    size="sm"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    onClick={() => handleDeleteSlide(slide.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SliderManagement;
