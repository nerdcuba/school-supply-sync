
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, ShoppingCart, User, Menu, X, Laptop } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "./LanguageSelector";

interface NavbarProps {
  cartItemsCount: number;
  onOpenCart: () => void;
}

const Navbar = ({ cartItemsCount, onOpenCart }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-lg border-b-4 border-primary sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="bg-primary text-white p-2 rounded-full">
              <GraduationCap size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-textPrimary">Plan Ahead Solutions</h1>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="nav-link">
              {t('nav.home')}
            </Link>
            <Link to="/schools" className="nav-link">
              {t('nav.schools')}
            </Link>
            <Link to="/electronics" className="nav-link flex items-center space-x-1">
              <Laptop size={16} />
              <span>Electrónicos</span>
            </Link>
            <Link to="/how-it-works" className="nav-link">
              {t('nav.howItWorks')}
            </Link>
            <Link to="/contact" className="nav-link">
              {t('nav.contact')}
            </Link>
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSelector />
            
            <Button
              onClick={onOpenCart}
              variant="outline"
              className="relative border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200"
            >
              <ShoppingCart size={20} className="mr-2" />
              {t('nav.cart')}
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-secondary text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Button>

            {user ? (
              <div className="flex items-center space-x-2">
                <Link to="/dashboard">
                  <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-textPrimary transition-all duration-200">
                    <User size={20} className="mr-2" />
                    {t('nav.dashboard')}
                  </Button>
                </Link>
                <Button onClick={handleLogout} variant="outline" className="hover:bg-secondary hover:text-white hover:border-secondary transition-all duration-200">
                  {t('nav.logout')}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="outline" className="hover:bg-primary hover:text-white hover:border-primary transition-all duration-200">{t('nav.login')}</Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-primary hover:bg-secondary text-white transition-all duration-200">{t('nav.register')}</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                className="nav-link py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.home')}
              </Link>
              <Link
                to="/schools"
                className="nav-link py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.schools')}
              </Link>
              <Link
                to="/electronics"
                className="nav-link py-2 flex items-center space-x-1"
                onClick={() => setIsMenuOpen(false)}
              >
                <Laptop size={16} />
                <span>Electrónicos</span>
              </Link>
              <Link
                to="/how-it-works"
                className="nav-link py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.howItWorks')}
              </Link>
              <Link
                to="/contact"
                className="nav-link py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.contact')}
              </Link>
              
              <div className="pt-4 border-t">
                <div className="flex justify-center mb-4">
                  <LanguageSelector />
                </div>
                
                <Button
                  onClick={() => {
                    onOpenCart();
                    setIsMenuOpen(false);
                  }}
                  variant="outline"
                  className="w-full mb-2 relative border-primary text-primary hover:bg-primary hover:text-white"
                >
                  <ShoppingCart size={20} className="mr-2" />
                  {t('nav.cart')} ({cartItemsCount})
                </Button>

                {user ? (
                  <div className="space-y-2">
                    <Link to="/dashboard">
                      <Button
                        variant="outline"
                        className="w-full border-accent text-accent hover:bg-accent hover:text-textPrimary"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User size={20} className="mr-2" />
                        {t('nav.dashboard')}
                      </Button>
                    </Link>
                    <Button onClick={handleLogout} variant="outline" className="w-full hover:bg-secondary hover:text-white hover:border-secondary">
                      {t('nav.logout')}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link to="/login">
                      <Button
                        variant="outline"
                        className="w-full hover:bg-primary hover:text-white hover:border-primary"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {t('nav.login')}
                      </Button>
                    </Link>
                    <Link to="/register">
                      <Button
                        className="w-full bg-primary hover:bg-secondary text-white"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {t('nav.register')}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
