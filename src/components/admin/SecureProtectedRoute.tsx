
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSecureAdmin } from '@/contexts/SecureAdminContext';

interface SecureProtectedRouteProps {
  children: React.ReactNode;
}

const SecureProtectedRoute = ({ children }: SecureProtectedRouteProps) => {
  console.log('🛡️ SecureProtectedRoute - RENDERING');
  
  const { isAdminAuthenticated, loading } = useSecureAdmin();
  const navigate = useNavigate();
  
  console.log('🛡️ SecureProtectedRoute - State:', { 
    isAdminAuthenticated, 
    loading
  });

  useEffect(() => {
    if (!loading && !isAdminAuthenticated) {
      console.log('🚫 SecureProtectedRoute - REDIRECTING TO LOGIN - Not authenticated');
      navigate('/admin/login', { replace: true });
    }
  }, [isAdminAuthenticated, loading, navigate]);

  // Show loading while checking authentication
  if (loading) {
    console.log('⏳ SecureProtectedRoute - Showing loading');
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-900 mx-auto mb-4"></div>
          <div className="text-lg">Verificando autenticación segura...</div>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render content (redirect will happen)
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg">Redirigiendo al login de administrador...</div>
      </div>
    );
  }

  console.log('✅ SecureProtectedRoute - Admin authenticated, showing content');
  return <>{children}</>;
};

export default SecureProtectedRoute;
