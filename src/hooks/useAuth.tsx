
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Purchase {
  id: string;
  date: string;
  total: number;
  items: any[];
  status: string;
}

interface AuthContextType {
  user: User | null;
  purchases: Purchase[];
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => void;
  addPurchase: (items: any[], total: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('planAheadUser');
    const savedPurchases = localStorage.getItem('planAheadPurchases');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedPurchases) {
      setPurchases(JSON.parse(savedPurchases));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple validation - in a real app, this would be handled by your backend
    if (email && password.length >= 6) {
      const userData = {
        id: '1',
        name: email.split('@')[0],
        email
      };
      setUser(userData);
      localStorage.setItem('planAheadUser', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (name && email && password.length >= 6) {
      const userData = {
        id: Date.now().toString(),
        name,
        email
      };
      setUser(userData);
      localStorage.setItem('planAheadUser', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('planAheadUser');
  };

  const updateProfile = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('planAheadUser', JSON.stringify(updatedUser));
    }
  };

  const addPurchase = (items: any[], total: number) => {
    const newPurchase: Purchase = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      total,
      items,
      status: 'Completado'
    };
    
    const updatedPurchases = [newPurchase, ...purchases];
    setPurchases(updatedPurchases);
    localStorage.setItem('planAheadPurchases', JSON.stringify(updatedPurchases));
  };

  return (
    <AuthContext.Provider value={{
      user,
      purchases,
      login,
      register,
      logout,
      updateProfile,
      addPurchase
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
