
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminContextType {
  isAdminAuthenticated: boolean;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => Promise<void>;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Verificar si hay sesión activa en Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          setIsAdminAuthenticated(false);
          setLoading(false);
          return;
        }

        // Verificar si el usuario tiene rol admin
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Error checking admin status:', profileError);
          setIsAdminAuthenticated(false);
        } else {
          const isAdmin = profile?.role === 'admin';
          setIsAdminAuthenticated(isAdmin);
          console.log('🔍 Estado admin verificado:', { isAdmin, role: profile?.role });
        }
      } catch (error) {
        console.error('Error in admin authentication check:', error);
        setIsAdminAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Admin auth state change:', event);
        if (event === 'SIGNED_OUT') {
          setIsAdminAuthenticated(false);
        } else if (event === 'SIGNED_IN' && session) {
          // Re-verificar el rol cuando hay un nuevo login
          setTimeout(checkAdminStatus, 100);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Intentando login con Supabase...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Admin login error:', error);
        toast({
          title: "Error de inicio de sesión",
          description: "Email o contraseña incorrectos",
          variant: "destructive",
        });
        return false;
      }

      if (!data.session) {
        toast({
          title: "Error",
          description: "No se pudo iniciar sesión",
          variant: "destructive",
        });
        return false;
      }

      // Verificar si el usuario tiene rol admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.session.user.id)
        .single();

      if (profileError || profile?.role !== 'admin') {
        console.error('❌ Usuario no es admin:', { profileError, role: profile?.role });
        toast({
          title: "Acceso denegado",
          description: "No tienes permisos de administrador",
          variant: "destructive",
        });
        await supabase.auth.signOut();
        setIsAdminAuthenticated(false);
        return false;
      }

      setIsAdminAuthenticated(true);
      console.log('✅ Login admin exitoso');
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión como administrador",
      });
      return true;
    } catch (error) {
      console.error('❌ Admin login error:', error);
      toast({
        title: "Error de inicio de sesión",
        description: "Email o contraseña incorrectos",
        variant: "destructive",
      });
      return false;
    }
  };

  const adminLogout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setIsAdminAuthenticated(false);
      console.log('👋 Admin logout completado');
      toast({
        title: "Sesión finalizada",
        description: "Has cerrado sesión correctamente",
      });
    } catch (error) {
      console.error('❌ Admin logout error:', error);
    }
  };

  return (
    <AdminContext.Provider value={{ 
      isAdminAuthenticated, 
      adminLogin, 
      adminLogout,
      loading
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
