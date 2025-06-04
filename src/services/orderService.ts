
import { supabase } from '@/integrations/supabase/client';

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

  // Obtener todas las órdenes (admin) - simplificado
  async getAll(): Promise<Order[]> {
    console.log('🔍 Obteniendo todas las órdenes (admin)...');
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ Admin no autenticado:', authError);
      throw new Error('Admin no autenticado');
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching all orders:', error);
      throw error;
    }
    
    console.log('📋 Todas las órdenes obtenidas:', data?.length || 0);
    return (data || []).map(order => ({
      ...order,
      items: Array.isArray(order.items) ? order.items : []
    }));
  },

  // Actualizar estado de una orden (admin) - VERSIÓN SIMPLIFICADA
  async updateStatus(orderId: string, status: string): Promise<Order> {
    console.log(`🔄 Actualizando orden ${orderId} a estado: ${status}`);
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ Admin no autenticado:', authError);
      throw new Error('Admin no autenticado');
    }
    
    // Validar que el estado sea uno de los permitidos
    const validStatuses = ['pendiente', 'procesando', 'completada', 'cancelada'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Estado inválido: ${status}. Estados permitidos: ${validStatuses.join(', ')}`);
    }
    
    console.log('✅ Usuario autenticado, procediendo con actualización...');
    
    // Actualización simplificada - las políticas RLS se encargan de los permisos
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select('*')
      .single();
    
    if (updateError) {
      console.error('❌ Error actualizando orden:', updateError);
      
      // Mensaje específico para errores comunes
      if (updateError.code === 'PGRST116') {
        throw new Error('No se encontró la orden o no tienes permisos para actualizarla. Verifica que eres administrador.');
      }
      
      throw new Error(`Error al actualizar la orden: ${updateError.message}`);
    }
    
    console.log('✅ Orden actualizada exitosamente en BD:', {
      id: updatedOrder.id,
      status: updatedOrder.status,
      updated_at: updatedOrder.updated_at
    });
    
    return {
      ...updatedOrder,
      items: Array.isArray(updatedOrder.items) ? updatedOrder.items : []
    };
  }
};
