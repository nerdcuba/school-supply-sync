
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
            {t('home.products.title')}
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Electronics */}
            <Card className="card-vibrant hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-blue-500 bg-opacity-10 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Laptop size={32} />
                </div>
                <CardTitle className="text-2xl mb-2 text-center">{t('home.electronics.title')}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-textPrimary mb-4">
                  {t('home.electronics.desc')}
                </p>
                <Link to="/electronics">
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                    {t('home.electronics.cta')}
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
                <CardTitle className="text-2xl mb-2 text-center">{t('home.packs.title')}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-textPrimary mb-4">
                  {t('home.packs.desc')}
                </p>
                <Link to="/schools">
                  <Button className="bg-green-500 hover:bg-green-600 text-white">
                    {t('home.packs.cta')}
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
            {t('home.reviews.title')}
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
                  {t('home.reviews.maria')}
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
                  {t('home.reviews.carlos')}
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
                  {t('home.reviews.ana')}
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
              <p className="text-textPrimary">{t('home.stats.satisfaction')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">
            {t('home.cta.ready')}
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-100">
            {t('home.cta.join')}
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
