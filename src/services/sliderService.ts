
import { supabase } from '@/integrations/supabase/client';

export interface SliderImage {
  id: string;
  title_key: string;
  subtitle_key: string;
  button_text_key: string | null;
  button_link: string;
  image_url: string;
  button_style: 'primary' | 'secondary' | 'accent';
  text_alignment: 'left' | 'center' | 'right';
  text_position: 'top' | 'center' | 'bottom';
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const sliderService = {
  // Obtener todos los slides activos
  async getActiveSlides(): Promise<SliderImage[]> {
    const { data, error } = await supabase
      .from('slider_images')
      .select('id, title_key, subtitle_key, button_text_key, button_link, image_url, button_style, text_alignment, text_position, display_order, is_active, created_at, updated_at')
      .eq('is_active', true)
      .order('display_order');

    if (error) {
      console.error('Error fetching slides:', error);
      return [];
    }

    return (data || []).map(slide => ({
      ...slide,
      button_style: slide.button_style as 'primary' | 'secondary' | 'accent',
      text_alignment: slide.text_alignment as 'left' | 'center' | 'right',
      text_position: slide.text_position as 'top' | 'center' | 'bottom'
    }));
  },

  // Obtener todos los slides (para admin)
  async getAllSlides(): Promise<SliderImage[]> {
    const { data, error } = await supabase
      .from('slider_images')
      .select('id, title_key, subtitle_key, button_text_key, button_link, image_url, button_style, text_alignment, text_position, display_order, is_active, created_at, updated_at')
      .order('display_order');

    if (error) {
      console.error('Error fetching all slides:', error);
      return [];
    }

    return (data || []).map(slide => ({
      ...slide,
      button_style: slide.button_style as 'primary' | 'secondary' | 'accent',
      text_alignment: slide.text_alignment as 'left' | 'center' | 'right',
      text_position: slide.text_position as 'top' | 'center' | 'bottom'
    }));
  },

  // Crear un nuevo slide
  async createSlide(slide: Omit<SliderImage, 'id' | 'created_at' | 'updated_at'>): Promise<SliderImage | null> {
    const { data, error } = await supabase
      .from('slider_images')
      .insert([slide])
      .select('id, title_key, subtitle_key, button_text_key, button_link, image_url, button_style, text_alignment, text_position, display_order, is_active, created_at, updated_at')
      .single();

    if (error) {
      console.error('Error creating slide:', error);
      return null;
    }

    return {
      ...data,
      button_style: data.button_style as 'primary' | 'secondary' | 'accent',
      text_alignment: data.text_alignment as 'left' | 'center' | 'right',
      text_position: data.text_position as 'top' | 'center' | 'bottom'
    };
  },

  // Actualizar un slide
  async updateSlide(id: string, updates: Partial<Omit<SliderImage, 'id' | 'created_at' | 'updated_at'>>): Promise<SliderImage | null> {
    const { data, error } = await supabase
      .from('slider_images')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, title_key, subtitle_key, button_text_key, button_link, image_url, button_style, text_alignment, text_position, display_order, is_active, created_at, updated_at')
      .single();

    if (error) {
      console.error('Error updating slide:', error);
      return null;
    }

    return {
      ...data,
      button_style: data.button_style as 'primary' | 'secondary' | 'accent',
      text_alignment: data.text_alignment as 'left' | 'center' | 'right',
      text_position: data.text_position as 'top' | 'center' | 'bottom'
    };
  },

  // Eliminar un slide
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
