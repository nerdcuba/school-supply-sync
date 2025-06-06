import { supabase } from '@/integrations/supabase/client';

export interface SliderImage {
  id: string;
  title_key: string;
  subtitle_key: string;
  button_text_key: string | null;
  button_link: string;
  image_url: string;
  background_color: string;
  button_style: 'primary' | 'secondary' | 'accent';
  text_alignment: 'left' | 'center' | 'right';
  text_position: 'top' | 'center' | 'bottom';
  display_order: number;
  is_active: boolean;
  image_shadow_enabled: boolean;
  image_shadow_color: string;
  title_color: string;
  subtitle_color: string;
  button_color: string;
  created_at: string;
  updated_at: string;
}

export const sliderService = {
  // Obtener todos los slides activos
  async getActiveSlides(): Promise<SliderImage[]> {
    const { data, error } = await supabase
      .from('slider_images')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (error) {
      console.error('Error fetching slides:', error);
      return [];
    }

    return (data || []).map(slide => ({
      ...slide,
      background_color: slide.background_color || '#1E90FF',
      button_style: slide.button_style as 'primary' | 'secondary' | 'accent',
      text_alignment: slide.text_alignment as 'left' | 'center' | 'right',
      text_position: slide.text_position as 'top' | 'center' | 'bottom',
      image_shadow_enabled: slide.image_shadow_enabled ?? true,
      image_shadow_color: slide.image_shadow_color || '#000000',
      title_color: slide.title_color || '#FFFFFF',
      subtitle_color: slide.subtitle_color || '#F3F4F6',
      button_color: slide.button_color || '#FFFFFF'
    }));
  },

  // Obtener todos los slides (para admin)
  async getAllSlides(): Promise<SliderImage[]> {
    const { data, error } = await supabase
      .from('slider_images')
      .select('*')
      .order('display_order');

    if (error) {
      console.error('Error fetching all slides:', error);
      return [];
    }

    return (data || []).map(slide => ({
      ...slide,
      background_color: slide.background_color || '#1E90FF',
      button_style: slide.button_style as 'primary' | 'secondary' | 'accent',
      text_alignment: slide.text_alignment as 'left' | 'center' | 'right',
      text_position: slide.text_position as 'top' | 'center' | 'bottom',
      image_shadow_enabled: slide.image_shadow_enabled ?? true,
      image_shadow_color: slide.image_shadow_color || '#000000',
      title_color: slide.title_color || '#FFFFFF',
      subtitle_color: slide.subtitle_color || '#F3F4F6',
      button_color: slide.button_color || '#FFFFFF'
    }));
  },

  // Crear un nuevo slide
  async createSlide(slide: Omit<SliderImage, 'id' | 'created_at' | 'updated_at'>): Promise<SliderImage | null> {
    const { data, error } = await supabase
      .from('slider_images')
      .insert([slide])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating slide:', error);
      return null;
    }

    return {
      ...data,
      background_color: data.background_color || '#1E90FF',
      button_style: data.button_style as 'primary' | 'secondary' | 'accent',
      text_alignment: data.text_alignment as 'left' | 'center' | 'right',
      text_position: data.text_position as 'top' | 'center' | 'bottom',
      image_shadow_enabled: data.image_shadow_enabled ?? true,
      image_shadow_color: data.image_shadow_color || '#000000',
      title_color: data.title_color || '#FFFFFF',
      subtitle_color: data.subtitle_color || '#F3F4F6',
      button_color: data.button_color || '#FFFFFF'
    };
  },

  // Actualizar un slide
  async updateSlide(id: string, updates: Partial<Omit<SliderImage, 'id' | 'created_at' | 'updated_at'>>): Promise<SliderImage | null> {
    const { data, error } = await supabase
      .from('slider_images')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating slide:', error);
      return null;
    }

    return {
      ...data,
      background_color: data.background_color || '#1E90FF',
      button_style: data.button_style as 'primary' | 'secondary' | 'accent',
      text_alignment: data.text_alignment as 'left' | 'center' | 'right',
      text_position: data.text_position as 'top' | 'center' | 'bottom',
      image_shadow_enabled: data.image_shadow_enabled ?? true,
      image_shadow_color: data.image_shadow_color || '#000000',
      title_color: data.title_color || '#FFFFFF',
      subtitle_color: data.subtitle_color || '#F3F4F6',
      button_color: data.button_color || '#FFFFFF'
    };
  },

  async deleteSlide(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('slider_images')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting slide:', error);
      return false;
    }

    return true;
  },

  // Subir imagen al storage
  async uploadImage(file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `slides/${fileName}`;

    const { error } = await supabase.storage
      .from('slider-images')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('slider-images')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  // Eliminar imagen del storage
  async deleteImage(imageUrl: string): Promise<boolean> {
    try {
      // Extraer el path de la URL
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(-2).join('/'); // slides/filename.ext

      const { error } = await supabase.storage
        .from('slider-images')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting image:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error parsing image URL:', error);
      return false;
    }
  }
};
