
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SupplyList from "@/components/SupplyList";
import { useLanguage } from "@/contexts/LanguageContext";
import { schoolService, School } from "@/services/schoolService";
import { toast } from "@/hooks/use-toast";

interface SchoolDetailsProps {
  onAddToCart: (item: any) => void;
}

const SchoolDetails = ({ onAddToCart }: SchoolDetailsProps) => {
  const { schoolId } = useParams();
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  // Cargar datos de la escuela desde Supabase
  useEffect(() => {
    const loadSchool = async () => {
      if (!schoolId) {
        setLoading(false);
        return;
      }

      try {
        const schools = await schoolService.getAll();
        const foundSchool = schools.find(s => s.id === schoolId);
        setSchool(foundSchool || null);
      } catch (error) {
        console.error('Error loading school:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información de la escuela",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadSchool();
  }, [schoolId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Cargando información de la escuela...</div>
        </div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Escuela no encontrada</h1>
          <Link to="/schools">
            <Button>{t('common.back')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 mb-6">
          <Link to="/schools" className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft size={20} className="mr-2" />
            {t('common.back')} {t('nav.schools')}
          </Link>
          <span className="text-gray-500">/</span>
          <span className="text-gray-900 font-medium">{school.name}</span>
          {selectedGrade && (
            <>
              <span className="text-gray-500">/</span>
              <span className="text-gray-900 font-medium">{selectedGrade}</span>
            </>
          )}
        </div>

        {/* School Header */}
        {!selectedGrade && (
          <div className="bg-white rounded-lg p-6 shadow-lg mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{school.name}</h1>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-gray-600">
                  <strong>Dirección:</strong> {school.address}
                </p>
                <p className="text-gray-600">
                  <strong>Teléfono:</strong> {school.phone}
                </p>
                {school.principal && (
                  <p className="text-gray-600">
                    <strong>Director(a):</strong> {school.principal}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-end">
                {school.website && (
                  <Button
                    onClick={() => window.open(school.website, '_blank')}
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    Visitar Sitio Web
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Supply List Component */}
        <SupplyList
          school={school.name}
          grade={selectedGrade}
          onSelectGrade={setSelectedGrade}
          onAddToCart={onAddToCart}
        />
      </div>
    </div>
  );
};

export default SchoolDetails;
