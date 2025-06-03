
import { supabase } from "@/integrations/supabase/client";

export interface SupplyItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface AdminSupplyPack {
  id: string;
  name: string;
  schoolId: string;
  schoolName: string;
  grade: string;
  items: SupplyItem[];
  created_at?: string;
  updated_at?: string;
}

export const adminSupplyPackService = {
  async getAll(): Promise<AdminSupplyPack[]> {
    const { data, error } = await supabase
      .from('admin_supply_packs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin supply packs:', error);
      throw error;
    }

    return data.map(pack => ({
      id: pack.id,
      name: pack.name,
      schoolId: pack.school_id || '',
      schoolName: pack.school_name,
      grade: pack.grade,
      items: Array.isArray(pack.items) ? pack.items : [],
      created_at: pack.created_at,
      updated_at: pack.updated_at
    }));
  },

  async create(pack: Omit<AdminSupplyPack, 'id'>): Promise<AdminSupplyPack> {
    const { data, error } = await supabase
      .from('admin_supply_packs')
      .insert({
        name: pack.name,
        school_id: pack.schoolId,
        school_name: pack.schoolName,
        grade: pack.grade,
        items: pack.items
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating admin supply pack:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      schoolId: data.school_id || '',
      schoolName: data.school_name,
      grade: data.grade,
      items: Array.isArray(data.items) ? data.items : [],
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  },

  async update(id: string, pack: Partial<AdminSupplyPack>): Promise<AdminSupplyPack> {
    const updateData: any = {};
    
    if (pack.name) updateData.name = pack.name;
    if (pack.schoolId) updateData.school_id = pack.schoolId;
    if (pack.schoolName) updateData.school_name = pack.schoolName;
    if (pack.grade) updateData.grade = pack.grade;
    if (pack.items) updateData.items = pack.items;

    const { data, error } = await supabase
      .from('admin_supply_packs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating admin supply pack:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      schoolId: data.school_id || '',
      schoolName: data.school_name,
      grade: data.grade,
      items: Array.isArray(data.items) ? data.items : [],
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('admin_supply_packs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting admin supply pack:', error);
      throw error;
    }
  }
};
