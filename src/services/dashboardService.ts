
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  totalOrders: number;
  totalItems: number;
  totalSpent: number;
  recentOrders: any[];
}

export const dashboardService = {
  // Obtener estadísticas del dashboard para el usuario actual
  async getUserStats(): Promise<DashboardStats> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        totalOrders: 0,
        totalItems: 0,
        totalSpent: 0,
        recentOrders: []
      };
    }

    // Obtener todas las órdenes del usuario
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }

    const totalOrders = orders?.length || 0;
    const totalItems = orders?.reduce((sum, order) => {
      const items = Array.isArray(order.items) ? order.items : [];
      return sum + items.length;
    }, 0) || 0;
    const totalSpent = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    const recentOrders = orders?.slice(0, 5) || [];

    return {
      totalOrders,
      totalItems,
      totalSpent,
      recentOrders
    };
  },

  // Obtener estadísticas generales para el admin
  async getAdminStats(): Promise<any> {
    const [ordersResult, schoolsResult, packsResult] = await Promise.all([
      supabase.from('orders').select('*', { count: 'exact' }),
      supabase.from('schools').select('*', { count: 'exact' }),
      supabase.from('admin_supply_packs').select('*', { count: 'exact' })
    ]);

    const totalRevenue = ordersResult.data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    const avgOrderValue = ordersResult.data?.length ? totalRevenue / ordersResult.data.length : 0;

    return {
      totalOrders: ordersResult.count || 0,
      totalSchools: schoolsResult.count || 0,
      totalPacks: packsResult.count || 0,
      totalRevenue,
      avgOrderValue
    };
  }
};
