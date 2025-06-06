import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient } from 'react-query';
import { LanguageProvider } from '@/contexts/LanguageContext';
import Home from '@/pages/Home';
import Schools from '@/pages/Schools';
import SchoolSupplies from '@/pages/SchoolSupplies';
import Contact from '@/pages/Contact';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLogin from '@/pages/AdminLogin';
import AdminDashboard from '@/pages/AdminDashboard';
import SecureProtectedRoute from '@/components/admin/SecureProtectedRoute';
import { Toaster } from '@/components/ui/toaster';
import { SecureAdminProvider } from '@/contexts/SecureAdminContext';

function App() {
  return (
    <BrowserRouter>
      <QueryClient>
        <LanguageProvider>
          <SecureAdminProvider>
            <div className="min-h-screen bg-background">
              <Toaster />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/schools" element={<Schools />} />
                <Route path="/school/:schoolId" element={<SchoolSupplies />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/admin/dashboard" element={
                  <SecureProtectedRoute>
                    <AdminDashboard />
                  </SecureProtectedRoute>
                } />
              </Routes>
            </div>
          </SecureAdminProvider>
        </LanguageProvider>
      </QueryClient>
    </BrowserRouter>
  );
}

export default App;
