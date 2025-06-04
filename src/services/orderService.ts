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

  // Actualizar estado de una orden (admin) - VERSIÓN CORREGIDA CON LOGS DETALLADOS
  async updateStatus(orderId: string, status: string): Promise<Order> {
    console.log(`🔄 Actualizando orden ${orderId} a estado: ${status}`);
    console.log('📋 Detalles de entrada:', { orderId: orderId, status: status, orderIdType: typeof orderId });
    
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
      .maybeSingle();

    if (profileError || profile?.role !== 'Admin') {
      console.error('❌ Usuario no es admin:', { profileError, role: profile?.role });
      throw new Error('No tienes permisos de administrador');
    }
    
    // Validar que el estado sea uno de los permitidos
    const validStatuses = ['pendiente', 'procesando', 'completada', 'cancelada'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Estado inválido: ${status}. Estados permitidos: ${validStatuses.join(', ')}`);
    }
    
    console.log('✅ Usuario admin verificado, buscando orden primero...');
    
    // PASO 1: Verificar que la orden existe ANTES de actualizarla
    const { data: existingOrder, error: findError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();
    
    console.log('🔍 Resultado de búsqueda de orden:', { 
      existingOrder: existingOrder, 
      findError: findError,
      orderId: orderId 
    });
    
    if (findError) {
      console.error('❌ Error buscando orden:', findError);
      throw new Error(`Error al buscar la orden: ${findError.message}`);
    }
    
    if (!existingOrder) {
      console.error('❌ Orden no encontrada con ID:', orderId);
      // Vamos a buscar todas las órdenes para ver qué IDs existen
      const { data: allOrders } = await supabase
        .from('orders')
        .select('id')
        .limit(5);
      console.log('📋 Primeras 5 órdenes en la BD:', allOrders);
      throw new Error(`No se encontró la orden con ID: ${orderId}`);
    }
    
    console.log('✅ Orden encontrada, procediendo con actualización...');
    console.log('📋 Estado actual de la orden:', existingOrder.status);
    
    // PASO 2: Actualizar la orden
    const { data: updatedOrders, error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select();
    
    console.log('🔄 Resultado de actualización:', { 
      updatedOrders: updatedOrders, 
      updateError: updateError,
      affectedRows: updatedOrders?.length || 0
    });
    
    if (updateError) {
      console.error('❌ Error actualizando orden:', updateError);
      throw new Error(`Error al actualizar la orden: ${updateError.message}`);
    }

    if (!updatedOrders || updatedOrders.length === 0) {
      console.error('❌ No se actualizó ninguna orden - posible problema de ID');
      throw new Error('No se pudo actualizar la orden - verificar ID');
    }

    if (updatedOrders.length > 1) {
      console.warn('⚠️ Se actualizaron múltiples órdenes, usando la primera');
    }
    
    const updatedOrder = updatedOrders[0];
    console.log('✅ Orden actualizada exitosamente:', { 
      id: updatedOrder.id, 
      oldStatus: existingOrder.status, 
      newStatus: updatedOrder.status 
    });
    
    return {
      ...updatedOrder,
      items: Array.isArray(updatedOrder.items) ? updatedOrder.items : []
    };
  }
};
