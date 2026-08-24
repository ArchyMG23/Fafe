const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const newApp = `
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
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

// Public CMS Pages
import { News } from './pages/public/News';
import { ArticleDetail } from './pages/public/ArticleDetail';
import { About } from './pages/public/About';
import { Gallery } from './pages/public/Gallery';

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

function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6]">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  useEffect(() => {
    initAuth();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Layout (No public navbar/footer) */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'CONTENT_MANAGER', 'FINANCE_MANAGER']} />}>
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Route>

        {/* Public Layout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/entrepreneures" element={<Directory />} />
          <Route path="/entrepreneures/:id" element={<DirectoryProfile />} />
          <Route path="/dons" element={<Donation />} />
          <Route path="/dons/succes" element={<DonationSuccess />} />
          
          <Route path="/connexion" element={<Login />} />
          <Route path="/inscription" element={<Register />} />
          <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
          
          {/* Protected Member Area */}
          <Route element={<ProtectedRoute />}>
            <Route path="/espace-membre/*" element={<MemberDashboard />} />
          </Route>
          
          {/* Redirects */}
          <Route path="/dashboard" element={<Navigate to="/espace-membre" replace />} />
          
          {/* New Public CMS Routes */}
          <Route path="/actualites" element={<News />} />
          <Route path="/actualites/:slug" element={<ArticleDetail />} />
          <Route path="/actualites/categorie/:slug" element={<News />} />
          <Route path="/actualites/tag/:slug" element={<News />} />
          <Route path="/a-propos/*" element={<About />} />
          <Route path="/galerie/*" element={<Gallery />} />
          <Route path="/recherche" element={<Placeholder title="Recherche Globale" />} />

          {/* Placeholders */}
          <Route path="/actions" element={<Placeholder title="Nos actions" />} />
          <Route path="/pays" element={<Placeholder title="Pays membres" />} />
          <Route path="/projets" element={<Placeholder title="Projets" />} />
          <Route path="/contact" element={<Placeholder title="Contact" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
`;

fs.writeFileSync(filePath, newApp);
console.log("App layout updated");
