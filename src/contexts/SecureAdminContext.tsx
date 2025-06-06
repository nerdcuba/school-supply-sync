
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { adminAuthService } from '@/services/adminAuthService';
import { toast } from '@/hooks/use-toast';

interface SecureAdminContextType {
  isAdminAuthenticated: boolean;
  loading: boolean;
  user: User | null;
  session: Session | null;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => Promise<void>;
  checkAdminAccess: () => Promise<boolean>;
}

const SecureAdminContext = createContext<SecureAdminContextType | undefined>(undefined);

interface SecureAdminProviderProps {
  children: ReactNode;
}

export const SecureAdminProvider = ({ children }: SecureAdminProviderProps) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [sessionTimeout, setSessionTimeout] = useState<NodeJS.Timeout | null>(null);

  console.log('🔐 SecureAdminProvider - Context initialized');

  // Session timeout duration (30 minutes)
  const SESSION_TIMEOUT = 30 * 60 * 1000;

  const startSessionTimeout = () => {
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
    }
    
    const timeout = setTimeout(() => {
      console.log('⏱️ Session timeout reached, logging out');
      adminLogout();
      toast({
        title: "Sesión expirada",
        description: "Tu sesión ha expirado por seguridad. Por favor, inicia sesión nuevamente.",
        variant: "destructive",
      });
    }, SESSION_TIMEOUT);
    
    setSessionTimeout(timeout);
  };

  const resetSessionTimeout = () => {
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
    }
    startSessionTimeout();
  };

  const checkAdminAccess = async (): Promise<boolean> => {
    try {
      console.log('🔍 Checking admin access...');
      const { session: currentSession, isAdmin } = await adminAuthService.getAdminSession();
      
      if (currentSession && isAdmin) {
        console.log('✅ Admin access confirmed');
        setUser(currentSession.user);
        setSession(currentSession);
        setIsAdminAuthenticated(true);
        startSessionTimeout();
        return true;
      } else {
        console.log('❌ Admin access denied');
        setUser(null);
        setSession(null);
        setIsAdminAuthenticated(false);
        return false;
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      setUser(null);
      setSession(null);
      setIsAdminAuthenticated(false);
      return false;
    }
  };

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Attempting admin login for:', email);
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Login error:', error.message);
        toast({
          title: "Error de inicio de sesión",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      if (data.user && data.session) {
        console.log('✅ User authenticated, verifying admin role...');
        const isAdmin = await adminAuthService.verifyAdminRole();
        
        if (isAdmin) {
          console.log('✅ Admin role confirmed');
          setUser(data.user);
          setSession(data.session);
          setIsAdminAuthenticated(true);
          startSessionTimeout();
          
          toast({
            title: "Bienvenido, Administrador",
            description: "Has iniciado sesión correctamente.",
          });
          return true;
        } else {
          console.log('❌ User is not admin');
          await supabase.auth.signOut();
          toast({
            title: "Acceso denegado",
            description: "No tienes permisos de administrador.",
            variant: "destructive",
          });
          return false;
        }
      }

      return false;
    } catch (error) {
      console.error('❌ Login error:', error);
      toast({
        title: "Error",
        description: "Ha ocurrido un error durante el inicio de sesión.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const adminLogout = async (): Promise<void> => {
    try {
      console.log('🚪 Admin logout initiated');
      
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
        setSessionTimeout(null);
      }
      
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setIsAdminAuthenticated(false);
      
      console.log('✅ Admin logout completed');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  // Initialize authentication state
  useEffect(() => {
    console.log('🔄 SecureAdminProvider - Setting up auth listener');
    
    const initializeAuth = async () => {
      setLoading(true);
      await checkAdminAccess();
      setLoading(false);
    };

    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('🔄 Auth state changed:', event, currentSession?.user?.email);
      
      if (event === 'SIGNED_OUT' || !currentSession) {
        console.log('🚪 User signed out or no session');
        setUser(null);
        setSession(null);
        setIsAdminAuthenticated(false);
        if (sessionTimeout) {
          clearTimeout(sessionTimeout);
          setSessionTimeout(null);
        }
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log('🔐 User signed in or token refreshed');
        // Don't automatically set as admin - let the login function handle admin verification
        if (currentSession) {
          setUser(currentSession.user);
          setSession(currentSession);
          resetSessionTimeout();
        }
      }
    });

    return () => {
      console.log('🧹 SecureAdminProvider - Cleaning up auth listener');
      subscription.unsubscribe();
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
      }
    };
  }, []);

  // Reset timeout on user activity
  useEffect(() => {
    if (!isAdminAuthenticated) return;

    const handleActivity = () => {
      resetSessionTimeout();
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [isAdminAuthenticated]);

  const contextValue: SecureAdminContextType = {
    isAdminAuthenticated,
    loading,
    user,
    session,
    adminLogin,
    adminLogout,
    checkAdminAccess,
  };

  return (
    <SecureAdminContext.Provider value={contextValue}>
      {children}
    </SecureAdminContext.Provider>
  );
};

export const useSecureAdmin = (): SecureAdminContextType => {
  const context = useContext(SecureAdminContext);
  if (context === undefined) {
    throw new Error('useSecureAdmin must be used within a SecureAdminProvider');
  }
  return context;
};
