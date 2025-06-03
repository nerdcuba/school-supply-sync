
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  
  console.log('🛡️ ProtectedRoute - Estado actual:', { 
    user: user?.email || 'NO USER', 
    loading,
    userExists: !!user 
  });

  // Mientras está cargando, mostrar spinner
  if (loading) {
    console.log('⏳ ProtectedRoute - Cargando...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-lg">Verificando autenticación...</div>
      </div>
    );
  }

  // Si no hay usuario autenticado, redirigir inmediatamente
  if (!user) {
    console.log('🚫 ProtectedRoute - REDIRIGIENDO A LOGIN - No hay usuario');
    return <Navigate to="/login" replace />;
  }

  console.log('✅ ProtectedRoute - Usuario autenticado, mostrando contenido');
  return <>{children}</>;
};

export default ProtectedRoute;
