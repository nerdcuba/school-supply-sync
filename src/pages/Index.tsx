
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ShoppingCart, BookOpen, Users, Laptop, GraduationCap, Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import HeroSlider from "@/components/HeroSlider";

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t('home.features.title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-vibrant text-center">
              <CardHeader>
                <div className="bg-primary bg-opacity-10 text-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} />
                </div>
                <CardTitle className="text-xl mb-2">{t('home.features.official.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-textPrimary">{t('home.features.official.desc')}</p>
              </CardContent>
            </Card>

            <Card className="card-vibrant text-center">
              <CardHeader>
                <div className="bg-secondary bg-opacity-10 text-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart size={32} />
                </div>
                <CardTitle className="text-xl mb-2">{t('home.features.convenient.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-textPrimary">{t('home.features.convenient.desc')}</p>
              </CardContent>
            </Card>

            <Card className="card-vibrant text-center">
              <CardHeader>
                <div className="bg-accent bg-opacity-10 text-accent w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen size={32} />
                </div>
                <CardTitle className="text-xl mb-2">{t('home.features.organized.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-textPrimary">{t('home.features.organized.desc')}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* New Products Section */}
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-textPrimary">
            Todo lo que necesitas para el éxito escolar
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Electronics */}
            <Card className="card-vibrant hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-blue-500 bg-opacity-10 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Laptop size={32} />
                </div>
                <CardTitle className="text-2xl mb-2 text-center">Electrónicos</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-textPrimary mb-4">
                  Laptops, tablets, audífonos, grabadores de voz y más tecnología para el aprendizaje
                </p>
                <Link to="/electronics">
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                    Ver Electrónicos
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Grade Packs */}
            <Card className="card-vibrant hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-green-500 bg-opacity-10 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap size={32} />
                </div>
                <CardTitle className="text-2xl mb-2 text-center">Packs por Grado</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-textPrimary mb-4">
                  Paquetes completos organizados por grado escolar con todos los útiles necesarios
                </p>
                <Link to="/schools">
                  <Button className="bg-green-500 hover:bg-green-600 text-white">
                    Ver Packs
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-textPrimary">
            Lo que dicen nuestros clientes
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-vibrant">
              <CardHeader>
                <div className="flex justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={20} className="text-yellow-400 fill-current" />
                  ))}
                </div>
                <CardTitle className="text-lg text-center">María González</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-textPrimary text-center italic">
                  "Excelente servicio. Todos los útiles llegaron a tiempo y de gran calidad. Mi hijo está súper contento con su pack escolar."
                </p>
              </CardContent>
            </Card>

            <Card className="card-vibrant">
              <CardHeader>
                <div className="flex justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={20} className="text-yellow-400 fill-current" />
                  ))}
                </div>
                <CardTitle className="text-lg text-center">Carlos Rodríguez</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-textPrimary text-center italic">
                  "La laptop que compramos es perfecta para las clases virtuales. Entrega rápida y precio justo."
                </p>
              </CardContent>
            </Card>

            <Card className="card-vibrant">
              <CardHeader>
                <div className="flex justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={20} className="text-yellow-400 fill-current" />
                  ))}
                </div>
                <CardTitle className="text-lg text-center">Ana Martínez</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-textPrimary text-center italic">
                  "Me encanta que todo venga organizado por grado. Ya no tengo que preocuparme por olvidar algo importante."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <p className="text-textPrimary">{t('nav.schools')}</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-secondary mb-2">10,000+</div>
              <p className="text-textPrimary">{t('schools.students')}</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">95%</div>
              <p className="text-textPrimary">Satisfacción</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">
            ¿Listo para simplificar el regreso a clases?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-100">
            Únete a miles de familias que ya confían en Plan Ahead Solutions para sus necesidades escolares.
          </p>
          <Link to="/schools">
            <Button size="lg" className="bg-white text-primary hover:bg-background hover:scale-105 px-8 py-4 text-lg transition-all duration-200">
              {t('home.cta')}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
