
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
    console.log(`🔄 Actualizando estado de orden ${orderId} a: ${status}`);
    
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
    
    console.log('✅ Usuario admin verificado, actualizando orden...');
    
    // Validar que el estado sea uno de los permitidos
    const validStatuses = ['pendiente', 'procesando', 'completada', 'cancelada'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Estado inválido: ${status}. Estados permitidos: ${validStatuses.join(', ')}`);
    }
    
    // Primero verificar que la orden existe
    const { data: existingOrder, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();
    
    if (fetchError) {
      console.error('❌ Error fetching order:', fetchError);
      throw new Error('Error al verificar la orden: ' + fetchError.message);
    }
    
    if (!existingOrder) {
      console.error('❌ Order not found:', orderId);
      throw new Error('Orden no encontrada');
    }
    
    console.log('✅ Orden encontrada, procediendo con actualización...');
    
    // Actualizar la orden
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .maybeSingle();
    
    if (error) {
      console.error('❌ Error updating order status:', error);
      throw new Error('Error al actualizar la orden: ' + error.message);
    }

    if (!data) {
      console.error('❌ No data returned after update for order:', orderId);
      throw new Error('No se pudo actualizar la orden - sin datos devueltos');
    }
    
    console.log('✅ Estado de orden actualizado correctamente:', data);
    return {
      ...data,
      items: Array.isArray(data.items) ? data.items : []
    };
  }
};
