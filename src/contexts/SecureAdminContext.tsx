
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { adminAuthService } from '@/services/adminAuthService';
import { loginRateLimiter } from '@/utils/inputValidation';

interface SecureAdminContextType {
  isAdminAuthenticated: boolean;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => Promise<void>;
  loading: boolean;
  sessionTimeout: number | null;
}

const SecureAdminContext = createContext<SecureAdminContextType | undefined>(undefined);

export const SecureAdminProvider = ({ children }: { children: ReactNode }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { session, isAdmin } = await adminAuthService.getAdminSession();
        
        if (session && isAdmin) {
          setIsAdminAuthenticated(true);
          setupSessionTimeout(session);
        } else {
          setIsAdminAuthenticated(false);
        }
      } catch (error) {
        console.error('Error in admin authentication check:', error);
        setIsAdminAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    const setupSessionTimeout = (session: any) => {
      if (session.expires_at) {
        const expiresAt = new Date(session.expires_at * 1000);
        const now = new Date();
        const timeUntilExpiry = expiresAt.getTime() - now.getTime();
        
        if (timeUntilExpiry > 0) {
          const timeoutId = setTimeout(() => {
            toast({
              title: "Sesión expirada",
              description: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
              variant: "destructive",
            });
            adminLogout();
          }, timeUntilExpiry);
          
          setSessionTimeout(timeoutId);
        }
      }
    };

    checkAdminStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Secure admin auth state change:', event);
        
        if (event === 'SIGNED_OUT') {
          setIsAdminAuthenticated(false);
          if (sessionTimeout) {
            clearTimeout(sessionTimeout);
            setSessionTimeout(null);
          }
        } else if (event === 'SIGNED_IN' && session) {
          setTimeout(checkAdminStatus, 100);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
      }
    };
  }, [sessionTimeout, toast]);

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    // Rate limiting check
    const userIdentifier = email.toLowerCase();
    
    if (!loginRateLimiter.checkLimit(userIdentifier)) {
      const remainingTime = Math.ceil(loginRateLimiter.getRemainingTime(userIdentifier) / 1000 / 60);
      toast({
        title: "Demasiados intentos",
        description: `Has excedido el límite de intentos. Intenta nuevamente en ${remainingTime} minutos.`,
        variant: "destructive",
      });
      return false;
    }

    try {
      console.log('🔐 Attempting secure admin login...');
      
      // Validate input
      if (!email || !password) {
        toast({
          title: "Error de validación",
          description: "Email y contraseña son requeridos",
          variant: "destructive",
        });
        return false;
      }

      if (password.length < 6) {
        toast({
          title: "Error de validación",
          description: "La contraseña debe tener al menos 6 caracteres",
          variant: "destructive",
        });
        return false;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      });

      if (error) {
        console.error('❌ Secure admin login error:', error);
        
        // Don't reveal specific error details for security
        toast({
          title: "Error de inicio de sesión",
          description: "Credenciales incorrectas",
          variant: "destructive",
        });
        return false;
      }

      if (!data.session) {
        toast({
          title: "Error",
          description: "No se pudo establecer la sesión",
          variant: "destructive",
        });
        return false;
      }

      // Verify admin status server-side
      const isAdmin = await adminAuthService.verifyAdminRole();
      
      if (!isAdmin) {
        console.error('❌ User is not admin');
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
      setupSessionTimeout(data.session);
      
      console.log('✅ Secure admin login successful');
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión como administrador",
      });
      return true;
    } catch (error) {
      console.error('❌ Secure admin login error:', error);
      toast({
        title: "Error del sistema",
        description: "Ha ocurrido un error inesperado",
        variant: "destructive",
      });
      return false;
    }
  };

  const adminLogout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setIsAdminAuthenticated(false);
      
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
        setSessionTimeout(null);
      }
      
      console.log('👋 Secure admin logout completed');
      toast({
        title: "Sesión finalizada",
        description: "Has cerrado sesión correctamente",
      });
    } catch (error) {
      console.error('❌ Secure admin logout error:', error);
    }
  };

  const setupSessionTimeout = (session: any) => {
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
    }
    
    if (session.expires_at) {
      const expiresAt = new Date(session.expires_at * 1000);
      const now = new Date();
      const timeUntilExpiry = expiresAt.getTime() - now.getTime();
      
      // Set timeout for 5 minutes before actual expiry to give warning
      const warningTime = Math.max(0, timeUntilExpiry - 5 * 60 * 1000);
      
      if (warningTime > 0) {
        const timeoutId = setTimeout(() => {
          toast({
            title: "Sesión por expirar",
            description: "Tu sesión expirará en 5 minutos",
          });
        }, warningTime);
        
        setSessionTimeout(timeoutId);
      }
    }
  };

  return (
    <SecureAdminContext.Provider value={{ 
      isAdminAuthenticated, 
      adminLogin, 
      adminLogout,
      loading,
      sessionTimeout
    }}>
      {children}
    </SecureAdminContext.Provider>
  );
};

export const useSecureAdmin = () => {
  const context = useContext(SecureAdminContext);
  if (context === undefined) {
    throw new Error('useSecureAdmin must be used within a SecureAdminProvider');
  }
  return context;
};
