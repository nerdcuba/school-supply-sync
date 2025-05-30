
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, ShoppingCart, User, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface NavbarProps {
  cartItemsCount: number;
  onOpenCart: () => void;
}

const Navbar = ({ cartItemsCount, onOpenCart }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-lg border-b-4 border-blue-600 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white p-2 rounded-full">
              <GraduationCap size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Plan Ahead Solutions</h1>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">
              Inicio
            </Link>
            <Link to="/schools" className="text-gray-700 hover:text-blue-600 transition-colors">
              Escuelas
            </Link>
            <Link to="/how-it-works" className="text-gray-700 hover:text-blue-600 transition-colors">
              Cómo Funciona
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-blue-600 transition-colors">
              Contacto
            </Link>
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              onClick={onOpenCart}
              variant="outline"
              className="relative border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <ShoppingCart size={20} className="mr-2" />
              Carrito
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Button>

            {user ? (
              <div className="flex items-center space-x-2">
                <Link to="/dashboard">
                  <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                    <User size={20} className="mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button onClick={handleLogout} variant="outline">
                  Cerrar Sesión
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="outline">Iniciar Sesión</Button>
                </Link>
                <Link to="/register">
                  <Button>Registrarse</Button>
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
                className="text-gray-700 hover:text-blue-600 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link
                to="/schools"
                className="text-gray-700 hover:text-blue-600 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Escuelas
              </Link>
              <Link
                to="/how-it-works"
                className="text-gray-700 hover:text-blue-600 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Cómo Funciona
              </Link>
              <Link
                to="/contact"
                className="text-gray-700 hover:text-blue-600 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Contacto
              </Link>
              
              <div className="pt-4 border-t">
                <Button
                  onClick={() => {
                    onOpenCart();
                    setIsMenuOpen(false);
                  }}
                  variant="outline"
                  className="w-full mb-2 relative"
                >
                  <ShoppingCart size={20} className="mr-2" />
                  Carrito ({cartItemsCount})
                </Button>

                {user ? (
                  <div className="space-y-2">
                    <Link to="/dashboard">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User size={20} className="mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                    <Button onClick={handleLogout} variant="outline" className="w-full">
                      Cerrar Sesión
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link to="/login">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Iniciar Sesión
                      </Button>
                    </Link>
                    <Link to="/register">
                      <Button
                        className="w-full"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Registrarse
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
