
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-1">
      <Globe size={16} className="text-gray-600" />
      <div className="flex border rounded-md overflow-hidden">
        <Button
          variant={language === 'es' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setLanguage('es')}
          className="rounded-none text-xs px-2 py-1 h-7"
        >
          ES
        </Button>
        <Button
          variant={language === 'en' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setLanguage('en')}
          className="rounded-none text-xs px-2 py-1 h-7"
        >
          EN
        </Button>
      </div>
    </div>
  );
};

export default LanguageSelector;
