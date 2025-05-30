
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const NotFound = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-blue-600 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Página no encontrada
          </h2>
          <p className="text-gray-600 mb-8">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link to="/">
            <Button className="w-full sm:w-auto">
              <Home size={20} className="mr-2" />
              Ir al Inicio
            </Button>
          </Link>
          
          <Link to="/schools">
            <Button variant="outline" className="w-full sm:w-auto ml-0 sm:ml-4">
              <ArrowLeft size={20} className="mr-2" />
              Ver {t('nav.schools')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
