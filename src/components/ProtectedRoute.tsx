
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  console.log('🛡️ ProtectedRoute - RENDERIZANDO');
  
  const { user, loading } = useAuth();
  
  console.log('🛡️ ProtectedRoute - Estado recibido:', { 
    user: user?.email || 'NO USER', 
    loading,
    userExists: !!user 
  });

  // Si está cargando, mostrar loading
  if (loading) {
    console.log('⏳ ProtectedRoute - Mostrando loading');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-lg">Verificando autenticación...</div>
      </div>
    );
  }

  // Si no hay usuario, redirigir
  if (!user) {
    console.log('🚫 ProtectedRoute - REDIRIGIENDO A LOGIN - No hay usuario autenticado');
    return <Navigate to="/login" replace />;
  }

  console.log('✅ ProtectedRoute - Usuario autenticado, mostrando contenido:', user.email);
  return <>{children}</>;
};

export default ProtectedRoute;
