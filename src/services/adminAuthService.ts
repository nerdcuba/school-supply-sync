
import { supabase } from '@/integrations/supabase/client';

export const adminAuthService = {
  // Verify if current user is admin on server side
  async verifyAdminRole(): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('is_user_admin');
      
      if (error) {
        console.error('Error verifying admin role:', error);
        return false;
      }
      
      return data === true;
    } catch (error) {
      console.error('Admin verification failed:', error);
      return false;
    }
  },

  // Get current user session with admin verification
  async getAdminSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        return { session: null, isAdmin: false };
      }

      const isAdmin = await this.verifyAdminRole();
      return { session, isAdmin };
    } catch (error) {
      console.error('Error getting admin session:', error);
      return { session: null, isAdmin: false };
    }
  },

  // Secure admin operation wrapper
  async executeAdminOperation<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    console.log(`🔐 Executing admin operation: ${operationName}`);
    
    const { isAdmin } = await this.getAdminSession();
    
    if (!isAdmin) {
      throw new Error(`Access denied: Admin privileges required for ${operationName}`);
    }
    
    return await operation();
  }
};
