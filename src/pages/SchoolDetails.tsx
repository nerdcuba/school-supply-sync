
import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SupplyList from "@/components/SupplyList";
import { useLanguage } from "@/contexts/LanguageContext";

const schoolsData = {
  "redland-elementary": {
    name: "Redland Elementary School",
    address: "24355 SW 167th Ave, Homestead, FL 33031",
    phone: "(305) 248-4688",
    principal: "Dra. María González",
    website: "https://redland.dadeschools.net"
  },
  "sunset-elementary": {
    name: "Sunset Elementary School",
    address: "15600 SW 80th St, Miami, FL 33193", 
    phone: "(305) 271-8200",
    principal: "Sr. Carlos Rodríguez",
    website: "https://sunset.dadeschools.net"
  },
  "coral-gables-senior": {
    name: "Coral Gables Senior High",
    address: "450 Bird Rd, Coral Gables, FL 33146",
    phone: "(305) 443-4871",
    principal: "Dra. Ana Martínez",
    website: "https://coralgables.dadeschools.net"
  },
  "palmetto-elementary": {
    name: "Palmetto Elementary School",
    address: "7460 SW 120th St, Miami, FL 33156",
    phone: "(305) 271-2300",
    principal: "Sr. Roberto Silva",
    website: "https://palmetto.dadeschools.net"
  },
  "southwood-middle": {
    name: "Southwood Middle School",
    address: "13850 SW 26th St, Miami, FL 33175",
    phone: "(305) 552-1900",
    principal: "Dra. Carmen López",
    website: "https://southwood.dadeschools.net"
  },
  "westchester-elementary": {
    name: "Westchester Elementary School",
    address: "9001 SW 24th St, Miami, FL 33165",
    phone: "(305) 551-4400",
    principal: "Sr. Luis Fernández",
    website: "https://westchester.dadeschools.net"
  }
};

interface SchoolDetailsProps {
  onAddToCart: (item: any) => void;
}

const SchoolDetails = ({ onAddToCart }: SchoolDetailsProps) => {
  const { schoolId } = useParams();
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const { t } = useLanguage();
  
  const school = schoolsData[schoolId as keyof typeof schoolsData];

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
                <p className="text-gray-600">
                  <strong>Director(a):</strong> {school.principal}
                </p>
              </div>
              <div className="flex items-center justify-end">
                <Button
                  onClick={() => window.open(school.website, '_blank')}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  Visitar Sitio Web
                </Button>
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
