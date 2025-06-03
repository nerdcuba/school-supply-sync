
import { supabase } from '@/integrations/supabase/client';

export interface School {
  id: string;
  name: string;
  address: string;
  phone: string;
  principal?: string;
  website?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const schoolService = {
  // Obtener todas las escuelas (público) - solo activas
  async getAll(): Promise<School[]> {
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      console.error('Error fetching schools:', error);
      throw error;
    }
    
    return data || [];
  },

  // Obtener todas las escuelas para admin (incluye inactivas)
  async getAllForAdmin(): Promise<School[]> {
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching schools:', error);
      throw error;
    }
    
    return data || [];
  },

  // Obtener una escuela por ID (público)
  async getById(id: string): Promise<School | null> {
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching school:', error);
      return null;
    }
    
    return data;
  },

  // Crear nueva escuela (admin)
  async create(school: Omit<School, 'id' | 'created_at' | 'updated_at'>): Promise<School> {
    const { data, error } = await supabase
      .from('schools')
      .insert([school])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating school:', error);
      throw error;
    }
    
    return data;
  },

  // Actualizar escuela (admin)
  async update(id: string, school: Partial<School>): Promise<School> {
    const { data, error } = await supabase
      .from('schools')
      .update({ ...school, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating school:', error);
      throw error;
    }
    
    return data;
  },

  // Alternar estado activo/inactivo de una escuela (admin)
  async toggleActive(id: string, isActive: boolean): Promise<School> {
    const { data, error } = await supabase
      .from('schools')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error toggling school status:', error);
      throw error;
    }
    
    return data;
  },

  // Eliminar escuela (admin)
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('schools')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting school:', error);
      throw error;
    }
  }
};
