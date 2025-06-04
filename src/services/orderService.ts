
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

  // Obtener todas las órdenes (admin) - mismos estados que usuarios
  async getAll(): Promise<Order[]> {
    console.log('🔍 Obteniendo todas las órdenes (admin)...');
    
    // Verificar autenticación de admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ Admin no autenticado:', authError);
      throw new Error('Admin no autenticado');
    }

    // Verificar que el usuario es admin - actualizar para usar 'Admin' (mayúscula)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'Admin') {
      console.error('❌ Usuario no es admin:', { profileError, role: profile?.role });
      throw new Error('No tienes permisos de administrador');
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

  // Actualizar estado de una orden (admin)
  async updateStatus(orderId: string, status: string): Promise<Order> {
    console.log(`🔄 Iniciando actualización de orden ${orderId} a estado: ${status}`);
    
    // Verificar autenticación de admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ Admin no autenticado:', authError);
      throw new Error('Admin no autenticado');
    }

    // Verificar que el usuario es admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'Admin') {
      console.error('❌ Usuario no es admin:', { profileError, role: profile?.role });
      throw new Error('No tienes permisos de administrador');
    }
    
    // Validar que el estado sea uno de los permitidos
    const validStatuses = ['pendiente', 'procesando', 'completada', 'cancelada'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Estado inválido: ${status}. Estados permitidos: ${validStatuses.join(', ')}`);
    }
    
    console.log('✅ Usuario admin verificado, procediendo con actualización...');
    
    try {
      // Primero, verificar que la orden existe
      const { data: existingOrder, error: checkError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();

      if (checkError) {
        console.error('❌ Error verificando orden:', checkError);
        throw new Error(`Error verificando la orden: ${checkError.message}`);
      }

      if (!existingOrder) {
        throw new Error('La orden no existe');
      }

      console.log('✅ Orden encontrada, procediendo con actualización');

      // Actualizar el estado
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (updateError) {
        console.error('❌ Error en actualización:', updateError);
        throw new Error(`Error al actualizar la orden: ${updateError.message}`);
      }

      console.log('✅ Actualización exitosa, obteniendo orden actualizada...');

      // Obtener la orden actualizada
      const { data: updatedOrder, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (fetchError || !updatedOrder) {
        console.error('❌ Error obteniendo orden actualizada:', fetchError);
        throw new Error('Error al obtener la orden actualizada');
      }
      
      console.log('✅ Orden actualizada exitosamente:', updatedOrder);
      
      return {
        ...updatedOrder,
        items: Array.isArray(updatedOrder.items) ? updatedOrder.items : []
      };
      
    } catch (error) {
      console.error('❌ Error general al actualizar orden:', error);
      throw error;
    }
  }
};
