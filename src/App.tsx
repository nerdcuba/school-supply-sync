
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from '@/contexts/LanguageContext';
import Index from '@/pages/Index';
import Schools from '@/pages/Schools';
import Contact from '@/pages/Contact';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLogin from '@/pages/AdminLogin';
import AdminDashboard from '@/pages/AdminDashboard';
import SecureProtectedRoute from '@/components/admin/SecureProtectedRoute';
import { Toaster } from '@/components/ui/toaster';
import { SecureAdminProvider } from '@/contexts/SecureAdminContext';

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <SecureAdminProvider>
            <div className="min-h-screen bg-background">
              <Toaster />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/schools" element={<Schools />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
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
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
