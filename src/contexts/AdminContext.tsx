
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminContextType {
  isAdminAuthenticated: boolean;
  adminLogin: (username: string, password: string) => Promise<boolean>;
  adminLogout: () => Promise<void>;
  loading: boolean;
  isSupabaseAdmin: boolean; // Nuevo: para distinguir entre admin hardcodeado y admin de Supabase
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isSupabaseAdmin, setIsSupabaseAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Verificar si hay una autenticación hardcodeada guardada
        const hardcodedAuth = localStorage.getItem('hardcoded_admin_auth');
        if (hardcodedAuth === 'true') {
          setIsAdminAuthenticated(true);
          setIsSupabaseAdmin(false);
          setLoading(false);
          console.log('🔑 Admin hardcodeado detectado');
          return;
        }

        // Verificar si hay sesión activa en Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          setIsAdminAuthenticated(false);
          setIsSupabaseAdmin(false);
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
          setIsSupabaseAdmin(false);
        } else {
          const isAdmin = profile?.role === 'admin';
          setIsAdminAuthenticated(isAdmin);
          setIsSupabaseAdmin(isAdmin);
          console.log('🔍 Estado admin verificado:', { isAdmin, role: profile?.role });
        }
      } catch (error) {
        console.error('Error in admin authentication check:', error);
        setIsAdminAuthenticated(false);
        setIsSupabaseAdmin(false);
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
          setIsSupabaseAdmin(false);
          localStorage.removeItem('hardcoded_admin_auth');
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

  const adminLogin = async (username: string, password: string): Promise<boolean> => {
    try {
      // Primero verificar credenciales hardcodeadas
      if (username === 'admin' && password === 'admin') {
        localStorage.setItem('hardcoded_admin_auth', 'true');
        setIsAdminAuthenticated(true);
        setIsSupabaseAdmin(false);
        console.log('✅ Login admin hardcodeado exitoso');
        toast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión como administrador",
        });
        return true;
      }

      // Si no son las credenciales hardcodeadas, intentar con Supabase
      console.log('🔐 Intentando login con Supabase...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: username,
        password
      });

      if (error) {
        console.error('❌ Admin login error:', error);
        toast({
          title: "Error de inicio de sesión",
          description: "Usuario o contraseña incorrectos",
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
        setIsSupabaseAdmin(false);
        return false;
      }

      setIsAdminAuthenticated(true);
      setIsSupabaseAdmin(true);
      console.log('✅ Login admin Supabase exitoso');
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión como administrador",
      });
      return true;
    } catch (error) {
      console.error('❌ Admin login error:', error);
      toast({
        title: "Error de inicio de sesión",
        description: "Usuario o contraseña incorrectos",
        variant: "destructive",
      });
      return false;
    }
  };

  const adminLogout = async (): Promise<void> => {
    try {
      // Limpiar autenticación hardcodeada
      localStorage.removeItem('hardcoded_admin_auth');
      
      // Cerrar sesión en Supabase si existe
      await supabase.auth.signOut();
      
      setIsAdminAuthenticated(false);
      setIsSupabaseAdmin(false);
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
      loading,
      isSupabaseAdmin
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
