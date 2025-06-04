

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

  // Obtener todas las órdenes (admin)
  async getAll(): Promise<Order[]> {
    console.log('🔍 Obteniendo todas las órdenes (admin)...');
    
    // Verificar si es admin hardcodeado
    const hardcodedAuth = localStorage.getItem('hardcoded_admin_auth');
    
    if (hardcodedAuth === 'true') {
      console.log('📋 Admin hardcodeado detectado - creando órdenes de demostración...');
      
      // Para el admin hardcodeado, devolver datos de demostración
      const demoOrders: Order[] = [
        {
          id: 'demo-order-1',
          user_id: 'demo-user-1',
          items: [
            {
              name: 'Pack de Útiles - 1er Grado',
              price: 850,
              quantity: 1,
              school: 'Escuela Primaria Demo',
              grade: '1er Grado',
              supplies: [
                { name: 'Cuadernos rayados', quantity: 5 },
                { name: 'Lápices #2', quantity: 10 },
                { name: 'Goma de borrar', quantity: 3 }
              ]
            }
          ],
          total: 850,
          status: 'completed',
          school_name: 'Escuela Primaria Demo',
          grade: '1er Grado',
          created_at: new Date(Date.now() - 86400000).toISOString(), // Ayer
          updated_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 'demo-order-2',
          user_id: 'demo-user-2',
          items: [
            {
              name: 'Pack de Útiles - 3er Grado',
              price: 1200,
              quantity: 2,
              school: 'Colegio Secundario Demo',
              grade: '3er Grado',
              supplies: [
                { name: 'Cuadernos cuadriculados', quantity: 8 },
                { name: 'Bolígrafos azules', quantity: 6 },
                { name: 'Regla 30cm', quantity: 2 }
              ]
            }
          ],
          total: 2400,
          status: 'processing',
          school_name: 'Colegio Secundario Demo',
          grade: '3er Grado',
          created_at: new Date(Date.now() - 172800000).toISOString(), // Hace 2 días
          updated_at: new Date(Date.now() - 172800000).toISOString()
        },
        {
          id: 'demo-order-3',
          user_id: 'demo-user-3',
          items: [
            {
              name: 'Pack de Útiles - Preescolar',
              price: 650,
              quantity: 1,
              school: 'Jardín de Niños Demo',
              grade: 'Preescolar',
              supplies: [
                { name: 'Crayones grandes', quantity: 1 },
                { name: 'Papel bond', quantity: 100 },
                { name: 'Tijeras punta roma', quantity: 1 }
              ]
            }
          ],
          total: 650,
          status: 'pending',
          school_name: 'Jardín de Niños Demo',
          grade: 'Preescolar',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      console.log('📋 Órdenes de demostración generadas:', demoOrders.length);
      return demoOrders;
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
      console.log('✅ Actualización simulada para admin de demostración (orden:', orderId, 'estado:', status, ')');
      // Para admin hardcodeado, simular la actualización
      return;
    }
    
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
    
    console.log('✅ Estado de orden actualizado correctamente');
  }
};

