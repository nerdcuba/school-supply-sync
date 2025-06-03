import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { orderService } from '@/services/orderService';

interface Purchase {
  id: string;
  date: string;
  total: number;
  items: any[];
  status: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  purchases: Purchase[];
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (userData: any) => Promise<void>;
  addPurchase: (items: any[], total: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  console.log('🔧 AuthProvider render - Estado:', { 
    user: user?.email || 'null', 
    session: !!session, 
    loading 
  });

  useEffect(() => {
    console.log('🚀 AuthProvider useEffect - INICIANDO configuración');
    
    // Verificar sesión existente PRIMERO
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('📋 Sesión inicial:', { 
        hasSession: !!session, 
        user: session?.user?.email || 'ninguno',
        error: error?.message || 'sin error'
      });
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      console.log('🏁 Sesión inicial procesada - loading = false');
    });

    // Configurar listener para cambios futuros
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 AUTH STATE CHANGE:', { 
          event, 
          hasSession: !!session,
          user: session?.user?.email || 'ninguno'
        });
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('✅ Usuario autenticado en cambio de estado');
          setTimeout(() => {
            loadUserOrders();
          }, 0);
        } else {
          console.log('❌ No hay usuario en cambio de estado');
          setPurchases([]);
        }
        
        // No cambiar loading aquí, ya se cambió en getSession
      }
    );

    return () => {
      console.log('🧹 Limpiando suscripción');
      subscription.unsubscribe();
    };
  }, []);

  const loadUserOrders = async () => {
    try {
      console.log('📦 Cargando órdenes...');
      const orders = await orderService.getUserOrders();
      const formattedPurchases = orders.map(order => ({
        id: order.id,
        date: order.created_at || new Date().toISOString(),
        total: order.total,
        items: order.items,
        status: order.status
      }));
      setPurchases(formattedPurchases);
      console.log('✅ Órdenes cargadas:', formattedPurchases.length);
    } catch (error) {
      console.error('❌ Error cargando órdenes:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Login error:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: name
          }
        }
      });
      
      if (error) {
        console.error('Register error:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setPurchases([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (userData: any): Promise<void> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          ...userData,
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Profile update error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const addPurchase = async (items: any[], total: number): Promise<void> => {
    if (!user) return;
    
    try {
      const order = await orderService.create({
        user_id: user.id,
        items,
        total,
        status: 'completed'
      });
      
      // Recargar órdenes del usuario
      await loadUserOrders();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const contextValue = {
    user,
    session,
    purchases,
    loading,
    login,
    register,
    logout,
    updateProfile,
    addPurchase
  };

  console.log('🎯 AuthProvider contexto final:', {
    user: user?.email || 'null',
    loading,
    hasSession: !!session
  });

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  console.log('🎣 useAuth llamado - retornando:', {
    user: context.user?.email || 'null',
    loading: context.loading
  });
  
  return context;
};
