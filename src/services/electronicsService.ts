
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Electronic = Database['public']['Tables']['electronics']['Row'];
type ElectronicInsert = Database['public']['Tables']['electronics']['Insert'];

// Tipo para el frontend con features como string[]
export interface ElectronicFrontend {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  original_price?: number;
  description?: string;
  image?: string;
  features: string[];
  rating: number;
  reviews: number;
  in_stock: boolean;
  created_at: string;
}

// Función para transformar datos de Supabase al formato del frontend
const transformElectronicData = (electronic: Electronic): ElectronicFrontend => {
  return {
    ...electronic,
    features: Array.isArray(electronic.features) ? electronic.features as string[] : [],
    rating: electronic.rating || 0,
    reviews: electronic.reviews || 0,
    in_stock: electronic.in_stock || true,
    original_price: electronic.original_price || undefined,
    description: electronic.description || undefined,
    image: electronic.image || undefined,
  };
};

export const electronicsService = {
  // Obtener todos los productos electrónicos
  async getElectronics() {
    try {
      const { data, error } = await supabase
        .from('electronics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { 
        data: (data || []).map(transformElectronicData), 
        error: null 
      };
    } catch (error) {
      console.error('Error fetching electronics:', error);
      return { data: [], error };
    }
  },

  // Obtener productos electrónicos por categoría
  async getElectronicsByCategory(category: string) {
    try {
      const { data, error } = await supabase
        .from('electronics')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { 
        data: (data || []).map(transformElectronicData), 
        error: null 
      };
    } catch (error) {
      console.error('Error fetching electronics by category:', error);
      return { data: [], error };
    }
  },

  // Obtener un producto electrónico por ID
  async getElectronicById(id: string) {
    try {
      const { data, error } = await supabase
        .from('electronics')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { 
        data: data ? transformElectronicData(data) : null, 
        error: null 
      };
    } catch (error) {
      console.error('Error fetching electronic by ID:', error);
      return { data: null, error };
    }
  },

  // Crear un nuevo producto electrónico
  async createElectronic(electronic: ElectronicInsert) {
    try {
      const { data, error } = await supabase
        .from('electronics')
        .insert([electronic])
        .select()
        .single();

      if (error) throw error;
      return { 
        data: data ? transformElectronicData(data) : null, 
        error: null 
      };
    } catch (error) {
      console.error('Error creating electronic:', error);
      return { data: null, error };
    }
  },

  // Actualizar un producto electrónico
  async updateElectronic(id: string, updates: Partial<ElectronicInsert>) {
    try {
      const { data, error } = await supabase
        .from('electronics')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { 
        data: data ? transformElectronicData(data) : null, 
        error: null 
      };
    } catch (error) {
      console.error('Error updating electronic:', error);
      return { data: null, error };
    }
  },

  // Eliminar un producto electrónico
  async deleteElectronic(id: string) {
    try {
      const { error } = await supabase
        .from('electronics')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting electronic:', error);
      return { error };
    }
  },

  // Buscar productos electrónicos
  async searchElectronics(searchTerm: string) {
    try {
      const { data, error } = await supabase
        .from('electronics')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { 
        data: (data || []).map(transformElectronicData), 
        error: null 
      };
    } catch (error) {
      console.error('Error searching electronics:', error);
      return { data: [], error };
    }
  }
};
