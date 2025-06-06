
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { loginRateLimiter, sanitizeInput } from '@/utils/inputValidation';

interface SecureAuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export const useSecureAuth = () => {
  console.log('🔐 useSecureAuth - INITIALIZING');
  
  const [authState, setAuthState] = useState<SecureAuthState>({
    user: null,
    session: null,
    loading: true
  });
  const { toast } = useToast();

  useEffect(() => {
    console.log('🔐 useSecureAuth - Setting up auth listener');

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 Auth state change:', event, session?.user?.email || 'no user');
        
        setAuthState({
          session,
          user: session?.user ?? null,
          loading: false
        });

        // Handle auth events securely
        if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out');
        } else if (event === 'SIGNED_IN') {
          console.log('✅ User signed in:', session?.user?.email);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token refreshed');
        }
      }
    );

    // THEN check for existing session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting initial session:', error);
        }
        
        console.log('📋 Initial session check:', session?.user?.email || 'no session');
        setAuthState({
          session,
          user: session?.user ?? null,
          loading: false
        });
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    getInitialSession();

    return () => {
      console.log('🧹 useSecureAuth - Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    // Rate limiting check
    const userIdentifier = email.toLowerCase();
    
    if (!loginRateLimiter.checkLimit(userIdentifier)) {
      const remainingTime = Math.ceil(loginRateLimiter.getRemainingTime(userIdentifier) / 1000 / 60);
      const error = `Demasiados intentos. Intenta nuevamente en ${remainingTime} minutos.`;
      toast({
        title: "Límite de intentos excedido",
        description: error,
        variant: "destructive",
      });
      return { error };
    }

    try {
      // Sanitize input
      const sanitizedEmail = sanitizeInput.sanitizeEmail(email);
      
      // Validate input
      if (!sanitizedEmail || !password) {
        const error = "Email y contraseña son requeridos";
        toast({
          title: "Error de validación",
          description: error,
          variant: "destructive",
        });
        return { error };
      }

      if (password.length < 6) {
        const error = "La contraseña debe tener al menos 6 caracteres";
        toast({
          title: "Error de validación",
          description: error,
          variant: "destructive",
        });
        return { error };
      }

      console.log('🔐 Attempting secure sign in for:', sanitizedEmail);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password
      });

      if (error) {
        console.error('❌ Sign in error:', error.message);
        
        // Generic error message for security
        const genericError = "Email o contraseña incorrectos";
        toast({
          title: "Error de inicio de sesión",
          description: genericError,
          variant: "destructive",
        });
        return { error: genericError };
      }

      console.log('✅ Sign in successful for:', data.user?.email);
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente",
      });
      
      return { data, error: null };
    } catch (error) {
      console.error('❌ Unexpected sign in error:', error);
      const errorMessage = "Ha ocurrido un error inesperado";
      toast({
        title: "Error del sistema",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: errorMessage };
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      // Sanitize input
      const sanitizedEmail = sanitizeInput.sanitizeEmail(email);
      const sanitizedName = name ? sanitizeInput.sanitizeString(name) : undefined;
      
      // Validate input
      if (!sanitizedEmail || !password) {
        const error = "Email y contraseña son requeridos";
        toast({
          title: "Error de validación",
          description: error,
          variant: "destructive",
        });
        return { error };
      }

      if (password.length < 6) {
        const error = "La contraseña debe tener al menos 6 caracteres";
        toast({
          title: "Error de validación",
          description: error,
          variant: "destructive",
        });
        return { error };
      }

      console.log('🔐 Attempting secure sign up for:', sanitizedEmail);
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: sanitizedName ? { name: sanitizedName } : undefined
        }
      });

      if (error) {
        console.error('❌ Sign up error:', error.message);
        toast({
          title: "Error de registro",
          description: error.message,
          variant: "destructive",
        });
        return { error: error.message };
      }

      console.log('✅ Sign up successful for:', data.user?.email);
      toast({
        title: "¡Registro exitoso!",
        description: "Por favor verifica tu email para activar tu cuenta",
      });
      
      return { data, error: null };
    } catch (error) {
      console.error('❌ Unexpected sign up error:', error);
      const errorMessage = "Ha ocurrido un error inesperado";
      toast({
        title: "Error del sistema",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: errorMessage };
    }
  };

  const signOut = async () => {
    try {
      console.log('🔐 Attempting secure sign out');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Sign out error:', error);
        toast({
          title: "Error al cerrar sesión",
          description: error.message,
          variant: "destructive",
        });
        return { error: error.message };
      }

      console.log('✅ Sign out successful');
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
      
      return { error: null };
    } catch (error) {
      console.error('❌ Unexpected sign out error:', error);
      const errorMessage = "Ha ocurrido un error inesperado";
      toast({
        title: "Error del sistema",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: errorMessage };
    }
  };

  console.log('🔐 useSecureAuth - Current state:', {
    user: authState.user?.email || 'no user',
    loading: authState.loading,
    hasSession: !!authState.session
  });

  return {
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    signIn,
    signUp,
    signOut
  };
};
