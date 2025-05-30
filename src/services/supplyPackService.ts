
import { supabase } from '@/integrations/supabase/client';

export interface SupplyPack {
  id: string;
  school_id?: string;
  grade: string;
  name: string;
  description?: string;
  price: number;
  items: any[];
  created_at?: string;
  updated_at?: string;
}

export const supplyPackService = {
  // Obtener packs por escuela y grado (público)
  async getBySchoolAndGrade(schoolId: string, grade: string): Promise<SupplyPack | null> {
    const { data, error } = await supabase
      .from('supply_packs')
      .select('*')
      .eq('school_id', schoolId)
      .eq('grade', grade)
      .single();
    
    if (error) {
      console.error('Error fetching supply pack:', error);
      return null;
    }
    
    return {
      ...data,
      items: Array.isArray(data.items) ? data.items : []
    };
  },

  // Obtener todos los packs (admin)
  async getAll(): Promise<SupplyPack[]> {
    const { data, error } = await supabase
      .from('supply_packs')
      .select('*')
      .order('grade');
    
    if (error) {
      console.error('Error fetching supply packs:', error);
      throw error;
    }
    
    return (data || []).map(pack => ({
      ...pack,
      items: Array.isArray(pack.items) ? pack.items : []
    }));
  },

  // Crear nuevo pack (admin)
  async create(pack: Omit<SupplyPack, 'id' | 'created_at' | 'updated_at'>): Promise<SupplyPack> {
    const { data, error } = await supabase
      .from('supply_packs')
      .insert([pack])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating supply pack:', error);
      throw error;
    }
    
    return {
      ...data,
      items: Array.isArray(data.items) ? data.items : []
    };
  },

  // Actualizar pack (admin)
  async update(id: string, pack: Partial<SupplyPack>): Promise<SupplyPack> {
    const { data, error } = await supabase
      .from('supply_packs')
      .update({ ...pack, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating supply pack:', error);
      throw error;
    }
    
    return {
      ...data,
      items: Array.isArray(data.items) ? data.items : []
    };
  },

  // Eliminar pack (admin)
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('supply_packs')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting supply pack:', error);
      throw error;
    }
  }
};
