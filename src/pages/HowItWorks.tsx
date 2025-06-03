
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, GraduationCap, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const HowItWorks = () => {
  const { t } = useLanguage();

  const steps = [
    {
      number: "01",
      title: t('howItWorks.step1.title'),
      description: t('howItWorks.step1.desc'),
      icon: Search,
      color: "blue"
    },
    {
      number: "02", 
      title: t('howItWorks.step2.title'),
      description: t('howItWorks.step2.desc'),
      icon: GraduationCap,
      color: "green"
    },
    {
      number: "03",
      title: t('howItWorks.step3.title'),
      description: t('howItWorks.step3.desc'),
      icon: ShoppingCart,
      color: "yellow"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            {t('howItWorks.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('howItWorks.subtitle')}
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            const isEven = index % 2 === 1;
            
            return (
              <div key={step.number} className={`flex flex-col md:flex-row items-center mb-16 ${isEven ? 'md:flex-row-reverse' : ''}`}>
                <div className="flex-1 mb-8 md:mb-0">
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full bg-${step.color}-100 text-${step.color}-600 flex items-center justify-center font-bold text-lg`}>
                          {step.number}
                        </div>
                        <CardTitle className="text-2xl">{step.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-lg">{step.description}</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className={`flex-shrink-0 mx-8 ${isEven ? 'md:mr-8 md:ml-0' : 'md:ml-8 md:mr-0'}`}>
                  <div className={`w-20 h-20 rounded-full bg-${step.color}-600 text-white flex items-center justify-center`}>
                    <IconComponent size={40} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Card className="max-w-2xl mx-auto bg-blue-600 text-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t('howItWorks.cta.ready')}
              </h2>
              <p className="text-blue-100 mb-6">
                {t('howItWorks.cta.find')}
              </p>
              <Link to="/schools">
                <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                  {t('home.cta')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
