
import { Link } from "react-router-dom";
import { GraduationCap, Mail, Phone, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-blue-600 text-white p-2 rounded-full">
                <GraduationCap size={20} />
              </div>
              <h3 className="text-xl font-bold text-white">Plan Ahead Solutions</h3>
            </div>
            <p className="text-white">
              {t('home.subtitle')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2 text-white">
              <li>
                <Link to="/" className="hover:text-gray-300 transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/schools" className="hover:text-gray-300 transition-colors">
                  {t('nav.schools')}
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-gray-300 transition-colors">
                  {t('nav.howItWorks')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gray-300 transition-colors">
                  {t('nav.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">{t('footer.account')}</h4>
            <ul className="space-y-2 text-white">
              <li>
                <Link to="/login" className="hover:text-gray-300 transition-colors">
                  {t('nav.login')}
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-gray-300 transition-colors">
                  {t('nav.register')}
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-gray-300 transition-colors">
                  {t('nav.dashboard')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">{t('footer.contact')}</h4>
            <div className="space-y-2 text-white">
              <div className="flex items-center space-x-2">
                <Mail size={16} />
                <span>info@planaheadsolutions.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={16} />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin size={16} />
                <span>Miami, FL</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-white">
          <p>&copy; 2024 Plan Ahead Solutions. {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
