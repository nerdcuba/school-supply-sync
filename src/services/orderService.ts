
import { supabase } from '@/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js';

export interface Order {
  id: string;
  user_id?: string;
  items: any[];
  total: number;
  status: string;
  school_name?: string;
  grade?: string;
  stripe_session_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Cliente con service role para admin hardcodeado
const supabaseServiceRole = createClient(
  'https://pcbdmqwjiecnnuyhkoup.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjYmRtcXdqaWVjbm51eWhrb3VwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODYzNjM5MSwiZXhwIjoyMDY0MjEyMzkxfQ.t1gNODI04tbP7P_XPKfp5vfm6GHmTFaYbaBcR5p2aP4',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export const orderService = {
  // Crear nueva orden (usuarios autenticados)
  async create(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> {
    console.log('🔄 Creando nueva orden...');
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ Error de autenticación:', authError);
      throw new Error('Usuario no autenticado');
    }

    const orderData = {
      ...order,
      user_id: user.id // Asegurar que siempre se incluya el user_id
    };

    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating order:', error);
      throw error;
    }
    
    console.log('✅ Orden creada exitosamente:', data.id);
    return {
      ...data,
      items: Array.isArray(data.items) ? data.items : []
    };
  },

  // Obtener órdenes del usuario (usuarios autenticados)
  async getUserOrders(): Promise<Order[]> {
    console.log('🔍 Obteniendo órdenes del usuario...');
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ Error de autenticación:', authError);
      return [];
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching user orders:', error);
      throw error;
    }
    
    console.log('📋 Órdenes del usuario obtenidas:', data?.length || 0);
    return (data || []).map(order => ({
      ...order,
      items: Array.isArray(order.items) ? order.items : []
    }));
  },

  // Obtener todas las órdenes (admin)
  async getAll(): Promise<Order[]> {
    console.log('🔍 Obteniendo todas las órdenes (admin)...');
    
    // Verificar si es admin hardcodeado
    const hardcodedAuth = localStorage.getItem('hardcoded_admin_auth');
    
    if (hardcodedAuth === 'true') {
      console.log('📋 Admin hardcodeado detectado, usando service role...');
      
      try {
        // Usar cliente con service role para admin hardcodeado
        const { data, error } = await supabaseServiceRole
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('❌ Error fetching orders for hardcoded admin:', error);
          return [];
        }
        
        console.log('📋 Órdenes obtenidas por admin hardcodeado:', data?.length || 0);
        return (data || []).map(order => ({
          ...order,
          items: Array.isArray(order.items) ? order.items : []
        }));
      } catch (error) {
        console.error('❌ Error con service role:', error);
        return [];
      }
    }
    
    // Para admin de Supabase autenticado, usar cliente normal con RLS
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ Admin no autenticado:', authError);
      return [];
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching all orders:', error);
      return [];
    }
    
    console.log('📋 Todas las órdenes obtenidas por admin Supabase:', data?.length || 0);
    return (data || []).map(order => ({
      ...order,
      items: Array.isArray(order.items) ? order.items : []
    }));
  },

  // Actualizar estado de una orden (admin)
  async updateStatus(orderId: string, status: string): Promise<void> {
    console.log(`🔄 Actualizando estado de orden ${orderId} a: ${status}`);
    
    // Verificar si es admin hardcodeado
    const hardcodedAuth = localStorage.getItem('hardcoded_admin_auth');
    
    if (hardcodedAuth === 'true') {
      console.log('🔄 Actualizando con service role (admin hardcodeado)...');
      
      const { error } = await supabaseServiceRole
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (error) {
        console.error('❌ Error updating order status with service role:', error);
        throw error;
      }
    } else {
      // Para admin de Supabase, usar cliente normal
      const { error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (error) {
        console.error('❌ Error updating order status:', error);
        throw error;
      }
    }
    
    console.log('✅ Estado de orden actualizado correctamente');
  }
};
