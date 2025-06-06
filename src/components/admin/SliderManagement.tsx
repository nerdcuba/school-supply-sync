import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Save, X, Upload, ArrowUp, ArrowDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sliderService, SliderImage } from '@/services/sliderService';

const SliderManagement = () => {
  const [slides, setSlides] = useState<SliderImage[]>([]);
  const [editingSlide, setEditingSlide] = useState<Partial<SliderImage> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSlides();
  }, []);

  const loadSlides = async () => {
    setIsLoading(true);
    const slidesData = await sliderService.getAllSlides();
    
    // Corregir automáticamente los display_order duplicados
    const correctedSlides = slidesData.map((slide, index) => ({
      ...slide,
      display_order: index
    }));
    
    // Si hay diferencias, actualizar en la base de datos
    const needsUpdate = slidesData.some((slide, index) => slide.display_order !== index);
    if (needsUpdate) {
      console.log('🔧 Corrigiendo órdenes de visualización duplicados...');
      for (let i = 0; i < correctedSlides.length; i++) {
        const slide = correctedSlides[i];
        if (slide.display_order !== i) {
          await sliderService.updateSlide(slide.id, { display_order: i });
        }
      }
      // Disparar evento para actualizar el slider
      window.dispatchEvent(new CustomEvent('slidesUpdated'));
    }
    
    setSlides(correctedSlides);
    setIsLoading(false);
  };

  const handleCreateSlide = () => {
    const newSlide: Partial<SliderImage> = {
      title_key: '',
      subtitle_key: '',
      button_text_key: '',
      button_link: '/',
      image_url: '',
      background_color: '#1E90FF',
      button_style: 'primary',
      text_alignment: 'center',
      text_position: 'center',
      display_order: slides.length,
      is_active: true,
      image_shadow_enabled: true,
      image_shadow_color: '#000000',
      title_color: '#FFFFFF',
      subtitle_color: '#F3F4F6',
      button_color: '#FFFFFF',
      button_background_color: '#3B82F6'
    };
    setEditingSlide(newSlide);
    setIsCreating(true);
  };

  const handleEditSlide = (slide: SliderImage) => {
    setEditingSlide({ ...slide });
    setIsCreating(false);
  };

  const moveSlide = async (slideId: string, direction: 'up' | 'down') => {
    const currentIndex = slides.findIndex(s => s.id === slideId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= slides.length) return;

    const newSlides = [...slides];
    [newSlides[currentIndex], newSlides[newIndex]] = [newSlides[newIndex], newSlides[currentIndex]];
    
    // Actualizar display_order en la base de datos
    try {
      await sliderService.updateSlide(newSlides[currentIndex].id, { display_order: currentIndex });
      await sliderService.updateSlide(newSlides[newIndex].id, { display_order: newIndex });
      
      // Actualizar estado local
      newSlides[currentIndex].display_order = currentIndex;
      newSlides[newIndex].display_order = newIndex;
      
      setSlides(newSlides);
      
      // Disparar evento para actualizar el slider
      window.dispatchEvent(new CustomEvent('slidesUpdated'));
      
      toast({
        title: "Éxito",
        description: "Orden actualizado correctamente"
      });
    } catch (error) {
      console.error('Error updating slide order:', error);
      toast({
        title: "Error",
        description: "Error al actualizar el orden",
        variant: "destructive"
      });
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo de imagen válido",
        variant: "destructive"
      });
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen no puede ser mayor a 5MB",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      const imageUrl = await sliderService.uploadImage(file);
      if (imageUrl && editingSlide) {
        setEditingSlide({
          ...editingSlide,
          image_url: imageUrl
        });
        toast({
          title: "Éxito",
          description: "Imagen subida correctamente"
        });
      } else {
        toast({
          title: "Error",
          description: "Error al subir la imagen",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Error al subir la imagen",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveSlide = async () => {
    if (!editingSlide) return;

    if (!editingSlide.title_key?.trim() || !editingSlide.subtitle_key?.trim()) {
      toast({
        title: "Error",
        description: "El título y subtítulo son requeridos",
        variant: "destructive"
      });
      return;
    }

    if (!editingSlide.image_url?.trim()) {
      toast({
        title: "Error",
        description: "La imagen es requerida",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isCreating) {
        const createdSlide = await sliderService.createSlide(editingSlide as Omit<SliderImage, 'id' | 'created_at' | 'updated_at'>);
        if (createdSlide) {
          setSlides([...slides, createdSlide]);
          toast({
            title: "Éxito",
            description: "Slide creado exitosamente"
          });
        }
      } else {
        const updatedSlide = await sliderService.updateSlide(editingSlide.id!, editingSlide);
        if (updatedSlide) {
          setSlides(slides.map(slide => 
            slide.id === updatedSlide.id ? updatedSlide : slide
          ));
          toast({
            title: "Éxito",
            description: "Slide actualizado exitosamente"
          });
        }
      }

      setEditingSlide(null);
      setIsCreating(false);
      
      // Disparar evento para actualizar el slider en tiempo real
      window.dispatchEvent(new CustomEvent('slidesUpdated'));
    } catch (error) {
      console.error('Error saving slide:', error);
      toast({
        title: "Error",
        description: "Error al guardar el slide",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSlide = async (slideId: string) => {
    if (slides.length <= 1) {
      toast({
        title: "Error",
        description: "Debe haber al menos un slide",
        variant: "destructive"
      });
      return;
    }

    const slideToDelete = slides.find(s => s.id === slideId);
    if (!slideToDelete) return;

    try {
      // Eliminar imagen del storage si es una URL de Supabase
      if (slideToDelete.image_url.includes('supabase')) {
        await sliderService.deleteImage(slideToDelete.image_url);
      }

      const success = await sliderService.deleteSlide(slideId);
      if (success) {
        setSlides(slides.filter(slide => slide.id !== slideId));
        toast({
          title: "Éxito",
          description: "Slide eliminado exitosamente"
        });
        
        // Disparar evento para actualizar el slider en tiempo real
        window.dispatchEvent(new CustomEvent('slidesUpdated'));
      }
    } catch (error) {
      console.error('Error deleting slide:', error);
      toast({
        title: "Error",
        description: "Error al eliminar el slide",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setEditingSlide(null);
    setIsCreating(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-900"></div>
      </div>
    );
  }

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
                  value={editingSlide.title_key || ''}
                  onChange={(e) => setEditingSlide({
                    ...editingSlide,
                    title_key: e.target.value
                  })}
                  placeholder="Ej: Listas Oficiales de Útiles Escolares"
                />
              </div>
              
              <div>
                <Label htmlFor="buttonText">Texto del Botón</Label>
                <Input
                  id="buttonText"
                  value={editingSlide.button_text_key || ''}
                  onChange={(e) => setEditingSlide({
                    ...editingSlide,
                    button_text_key: e.target.value
                  })}
                  placeholder="Ej: Ver Escuelas"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="subtitle">Subtítulo *</Label>
              <Textarea
                id="subtitle"
                value={editingSlide.subtitle_key || ''}
                onChange={(e) => setEditingSlide({
                  ...editingSlide,
                  subtitle_key: e.target.value
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
                  value={editingSlide.button_link || ''}
                  onChange={(e) => setEditingSlide({
                    ...editingSlide,
                    button_link: e.target.value
                  })}
                  placeholder="Ej: /schools"
                />
              </div>

              <div>
                <Label htmlFor="displayOrder">Orden de Visualización *</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  min="0"
                  value={editingSlide.display_order || 0}
                  onChange={(e) => setEditingSlide({
                    ...editingSlide,
                    display_order: parseInt(e.target.value) || 0
                  })}
                  placeholder="0"
                />
              </div>
            </div>

            
            
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-semibold">Colores de Texto</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="titleColor">Color del Título</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="titleColor"
                      type="color"
                      value={editingSlide.title_color || '#FFFFFF'}
                      onChange={(e) => setEditingSlide({
                        ...editingSlide,
                        title_color: e.target.value
                      })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={editingSlide.title_color || '#FFFFFF'}
                      onChange={(e) => setEditingSlide({
                        ...editingSlide,
                        title_color: e.target.value
                      })}
                      placeholder="#FFFFFF"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subtitleColor">Color del Subtítulo</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="subtitleColor"
                      type="color"
                      value={editingSlide.subtitle_color || '#F3F4F6'}
                      onChange={(e) => setEditingSlide({
                        ...editingSlide,
                        subtitle_color: e.target.value
                      })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={editingSlide.subtitle_color || '#F3F4F6'}
                      onChange={(e) => setEditingSlide({
                        ...editingSlide,
                        subtitle_color: e.target.value
                      })}
                      placeholder="#F3F4F6"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="buttonTextColor">Color del Texto del Botón</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="buttonTextColor"
                      type="color"
                      value={editingSlide.button_color || '#FFFFFF'}
                      onChange={(e) => setEditingSlide({
                        ...editingSlide,
                        button_color: e.target.value
                      })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={editingSlide.button_color || '#FFFFFF'}
                      onChange={(e) => setEditingSlide({
                        ...editingSlide,
                        button_color: e.target.value
                      })}
                      placeholder="#FFFFFF"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="backgroundColor">Color de Fondo del Slide *</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="backgroundColor"
                  type="color"
                  value={editingSlide.background_color || '#1E90FF'}
                  onChange={(e) => setEditingSlide({
                    ...editingSlide,
                    background_color: e.target.value
                  })}
                  className="w-20 h-10"
                />
                <Input
                  value={editingSlide.background_color || '#1E90FF'}
                  onChange={(e) => setEditingSlide({
                    ...editingSlide,
                    background_color: e.target.value
                  })}
                  placeholder="#1E90FF"
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="buttonBackgroundColor">Color de Fondo del Botón *</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="buttonBackgroundColor"
                  type="color"
                  value={editingSlide.button_background_color || '#3B82F6'}
                  onChange={(e) => setEditingSlide({
                    ...editingSlide,
                    button_background_color: e.target.value
                  })}
                  className="w-20 h-10"
                />
                <Input
                  value={editingSlide.button_background_color || '#3B82F6'}
                  onChange={(e) => setEditingSlide({
                    ...editingSlide,
                    button_background_color: e.target.value
                  })}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="buttonStyle">Estilo del Botón (informativo)</Label>
                <Select
                  value={editingSlide.button_style || 'primary'}
                  onValueChange={(value: 'primary' | 'secondary' | 'accent') => 
                    setEditingSlide({
                      ...editingSlide,
                      button_style: value
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primario</SelectItem>
                    <SelectItem value="secondary">Secundario</SelectItem>
                    <SelectItem value="accent">Acento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="textAlignment">Alineación del Texto</Label>
                <Select
                  value={editingSlide.text_alignment || 'center'}
                  onValueChange={(value: 'left' | 'center' | 'right') => 
                    setEditingSlide({
                      ...editingSlide,
                      text_alignment: value
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Izquierda</SelectItem>
                    <SelectItem value="center">Centro</SelectItem>
                    <SelectItem value="right">Derecha</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="textPosition">Posición Vertical del Texto</Label>
              <Select
                value={editingSlide.text_position || 'center'}
                onValueChange={(value: 'top' | 'center' | 'bottom') => 
                  setEditingSlide({
                    ...editingSlide,
                    text_position: value
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">Arriba</SelectItem>
                  <SelectItem value="center">Centro</SelectItem>
                  <SelectItem value="bottom">Abajo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="imageShadow"
                  checked={editingSlide.image_shadow_enabled || false}
                  onCheckedChange={(checked) => setEditingSlide({
                    ...editingSlide,
                    image_shadow_enabled: checked
                  })}
                />
                <Label htmlFor="imageShadow">Habilitar sombra en la imagen</Label>
              </div>

              {editingSlide.image_shadow_enabled && (
                <div>
                  <Label htmlFor="shadowColor">Color de la Sombra</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="shadowColor"
                      type="color"
                      value={editingSlide.image_shadow_color || '#000000'}
                      onChange={(e) => setEditingSlide({
                        ...editingSlide,
                        image_shadow_color: e.target.value
                      })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={editingSlide.image_shadow_color || '#000000'}
                      onChange={(e) => setEditingSlide({
                        ...editingSlide,
                        image_shadow_color: e.target.value
                      })}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Label>Imagen *</Label>
              
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="hidden"
                  id="image-upload"
                />
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <Button 
                    type="button" 
                    variant="outline" 
                    disabled={isUploading}
                    asChild
                  >
                    <span>
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-900 mr-2"></div>
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <Upload size={16} className="mr-2" />
                          Subir Imagen
                        </>
                      )}
                    </span>
                  </Button>
                </Label>
                <span className="text-sm text-gray-500">Máximo 5MB</span>
              </div>

              <div>
                <Label htmlFor="imageUrl">O ingresa URL de imagen</Label>
                <Input
                  id="imageUrl"
                  value={editingSlide.image_url || ''}
                  onChange={(e) => setEditingSlide({
                    ...editingSlide,
                    image_url: e.target.value
                  })}
                  placeholder="https://..."
                />
              </div>

              {editingSlide.image_url && (
                <div className="mt-2 p-4 rounded-md" style={{ backgroundColor: editingSlide.background_color || '#1E90FF' }}>
                  <p className="text-white text-sm mb-2">Vista previa del diseño:</p>
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1">
                      <h3 
                        className="font-bold text-lg"
                        style={{ color: editingSlide.title_color || '#FFFFFF' }}
                      >
                        {editingSlide.title_key || 'Título del slide'}
                      </h3>
                      <p 
                        className="text-sm opacity-90"
                        style={{ color: editingSlide.subtitle_color || '#F3F4F6' }}
                      >
                        {editingSlide.subtitle_key || 'Subtítulo del slide'}
                      </p>
                      {editingSlide.button_text_key && (
                        <button 
                          className="mt-2 px-3 py-1 rounded text-sm transition-all"
                          style={{ 
                            color: editingSlide.button_color || '#FFFFFF',
                            backgroundColor: editingSlide.button_background_color || '#3B82F6'
                          }}
                        >
                          {editingSlide.button_text_key}
                        </button>
                      )}
                    </div>
                    <div 
                      className={`w-32 h-24 rounded overflow-hidden ${editingSlide.image_shadow_enabled ? 'shadow-2xl' : ''}`}
                      style={editingSlide.image_shadow_enabled ? {
                        boxShadow: `0 25px 50px -12px ${editingSlide.image_shadow_color}80`
                      } : {}}
                    >
                      <img 
                        src={editingSlide.image_url} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';
                        }}
                      />
                    </div>
                  </div>
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

      {/* Lista de slides existentes con controles de orden */}
      <div className="grid gap-4">
        {slides.map((slide, index) => (
          <Card key={slide.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col items-center gap-1">
                    <Button
                      onClick={() => moveSlide(slide.id, 'up')}
                      variant="outline"
                      size="sm"
                      disabled={index === 0}
                      className="h-8 w-8 p-0"
                    >
                      <ArrowUp size={12} />
                    </Button>
                    <span className="text-xs font-semibold bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      {index + 1}
                    </span>
                    <Button
                      onClick={() => moveSlide(slide.id, 'down')}
                      variant="outline"
                      size="sm"
                      disabled={index === slides.length - 1}
                      className="h-8 w-8 p-0"
                    >
                      <ArrowDown size={12} />
                    </Button>
                  </div>
                  <div 
                    className="w-16 h-12 rounded overflow-hidden flex items-center justify-center"
                    style={{ backgroundColor: slide.background_color }}
                  >
                    <img 
                      src={slide.image_url} 
                      alt={`Slide ${index + 1}`}
                      className="w-8 h-8 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {slide.title_key || `Slide ${index + 1}`}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {slide.subtitle_key}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span 
                        className="px-2 py-1 rounded text-xs text-white"
                        style={{ backgroundColor: slide.background_color }}
                      >
                        Fondo: {slide.background_color}
                      </span>
                      <span 
                        className="px-2 py-1 rounded text-xs"
                        style={{ 
                          backgroundColor: slide.button_background_color,
                          color: slide.button_color
                        }}
                      >
                        Botón
                      </span>
                      <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                        {slide.text_alignment} / {slide.text_position}
                      </span>
                      {slide.image_shadow_enabled && (
                        <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                          Sombra
                        </span>
                      )}
                      <span className="text-xs text-gray-500">→ {slide.button_link}</span>
                      {!slide.is_active && (
                        <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">
                          Inactivo
                        </span>
                      )}
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
