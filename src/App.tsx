import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { Directory } from './pages/Directory';
import { DirectoryProfile } from './pages/DirectoryProfile';
import { Donation } from './pages/Donation';
import { DonationSuccess } from './pages/DonationSuccess';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { MemberDashboard } from './pages/dashboard/MemberDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { initAuth } from './store/auth';

// Generic placeholder component for unimplemented routes
function Placeholder({ title }: { title: string }) {
  return (
    <div className="container mx-auto px-4 py-20 min-h-[60vh] flex flex-col items-center justify-center text-center">
      <h1 className="text-3xl font-bold font-heading text-[#6B3E1E] mb-4">{title}</h1>
      <p className="text-[#6B3E1E]/60 max-w-md">
        Cette section est en cours de construction et sera disponible prochainement dans la prochaine version de la plateforme.
      </p>
    </div>
  );
}

function App() {
  useEffect(() => {
    initAuth();
  }, []);

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-[#FAF9F6]">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/entrepreneures" element={<Directory />} />
            <Route path="/entrepreneures/:id" element={<DirectoryProfile />} />
            <Route path="/dons" element={<Donation />} />
            <Route path="/dons/succes" element={<DonationSuccess />} />
            <Route path="/connexion" element={<Login />} />
            <Route path="/inscription" element={<Register />} />
            <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
            
            {/* Redirects for legacy routes */}
            <Route path="/dashboard" element={<Navigate to="/espace-membre" replace />} />
            
            {/* Placeholders for unimplemented routes */}
            <Route path="/about" element={<Placeholder title="À propos" />} />
            <Route path="/actions" element={<Placeholder title="Nos actions" />} />
            <Route path="/pays" element={<Placeholder title="Pays membres" />} />
            <Route path="/actualites" element={<Placeholder title="Actualités" />} />
            <Route path="/projets" element={<Placeholder title="Projets" />} />
            <Route path="/contact" element={<Placeholder title="Contact" />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/espace-membre/*" element={<MemberDashboard />} />
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']} />}>
              <Route path="/admin/*" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
