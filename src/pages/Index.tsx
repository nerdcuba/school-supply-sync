
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ShoppingCart, BookOpen, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            {t('home.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            {t('home.subtitle')}
          </p>
          <Link to="/schools">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
              {t('home.cta')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {t('home.features.title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} />
                </div>
                <CardTitle className="text-xl mb-2">{t('home.features.official.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{t('home.features.official.desc')}</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart size={32} />
                </div>
                <CardTitle className="text-xl mb-2">{t('home.features.convenient.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{t('home.features.convenient.desc')}</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-yellow-100 text-yellow-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen size={32} />
                </div>
                <CardTitle className="text-xl mb-2">{t('home.features.organized.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{t('home.features.organized.desc')}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
              <p className="text-gray-600">{t('nav.schools')}</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">10,000+</div>
              <p className="text-gray-600">{t('schools.students')}</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-600 mb-2">95%</div>
              <p className="text-gray-600">Satisfacción</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            ¿Listo para simplificar el regreso a clases?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Únete a miles de familias que ya confían en Plan Ahead Solutions para sus necesidades escolares.
          </p>
          <Link to="/schools">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg">
              {t('home.cta')}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
