
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AdminUser {
  username: string;
  password: string;
}

interface AdminContextType {
  isAdminAuthenticated: boolean;
  adminLogin: (username: string, password: string) => boolean;
  adminLogout: () => void;
  updateAdminCredentials: (newUsername: string, newPassword: string) => void;
  currentAdmin: AdminUser | null;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);

  // Load admin credentials from localStorage or use defaults
  useEffect(() => {
    const savedAdmin = localStorage.getItem('adminCredentials');
    if (savedAdmin) {
      setCurrentAdmin(JSON.parse(savedAdmin));
    } else {
      // Set default credentials
      const defaultAdmin = { username: 'admin', password: 'admin' };
      setCurrentAdmin(defaultAdmin);
      localStorage.setItem('adminCredentials', JSON.stringify(defaultAdmin));
    }

    // Check if admin is already logged in
    const adminSession = localStorage.getItem('adminSession');
    if (adminSession === 'true') {
      setIsAdminAuthenticated(true);
    }
  }, []);

  const adminLogin = (username: string, password: string): boolean => {
    if (currentAdmin && username === currentAdmin.username && password === currentAdmin.password) {
      setIsAdminAuthenticated(true);
      localStorage.setItem('adminSession', 'true');
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('adminSession');
  };

  const updateAdminCredentials = (newUsername: string, newPassword: string) => {
    const newAdmin = { username: newUsername, password: newPassword };
    setCurrentAdmin(newAdmin);
    localStorage.setItem('adminCredentials', JSON.stringify(newAdmin));
  };

  return (
    <AdminContext.Provider value={{
      isAdminAuthenticated,
      adminLogin,
      adminLogout,
      updateAdminCredentials,
      currentAdmin
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
