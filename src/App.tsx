import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HubLayout } from './components/layout/HubLayout';
import { PublicEntrepreneurs } from './pages/public/PublicEntrepreneurs';
import { Join } from './pages/public/Join';
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
import { RequireMembership } from './components/auth/RequireMembership';
import { initAuth } from './store/auth';

// Public CMS Pages
import { News } from './pages/public/News';
import { ArticleDetail } from './pages/public/ArticleDetail';
import { About } from './pages/public/About';
import { Actions } from './pages/public/Actions';
import { AboutAndActions } from './pages/public/AboutAndActions';
import { NewsAndEvents } from './pages/public/NewsAndEvents';
import { Gallery } from './pages/public/Gallery';
import { HubIntro } from './pages/public/HubIntro';

// Public Event Pages
import { EventList } from './pages/public/events/EventList';
import { EventDetails } from './pages/public/events/EventDetails';
import { EventRegistration } from './pages/public/events/EventRegistration';
import { EventRegistrationSuccess } from './pages/public/events/EventRegistrationSuccess';
import { CertificateVerification } from './pages/public/events/CertificateVerification';

import { ProjectsList } from './pages/public/Projects';
import { ProjectDetail } from './pages/public/ProjectDetail';
import { MarketplaceLayout } from './pages/public/marketplace/MarketplaceLayout';

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

import { MemberProfile } from './pages/dashboard/MemberProfile';
import { MemberAdhesion } from "./pages/dashboard/MemberAdhesion";

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
      <ScrollToTop />
      <Routes>
        {/* Admin Layout (No public navbar/footer) */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'CONTENT_MANAGER', 'FINANCE_MANAGER']} />}>
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Route>

        {/* FAFE HUB (Private/Operational Platform) */}
        <Route path="/hub" element={<HubLayout />}>
          {/* Public Hub Routes */}
          <Route index element={<HubIntro />} />
          <Route path="connexion" element={<Login />} />
          <Route path="inscription" element={<Register />} />
          <Route path="mot-de-passe-oublie" element={<ForgotPassword />} />
          
          {/* Protected Hub Routes */}
          <Route element={<ProtectedRoute />}>
            {/* Dashboard and profil are available to non-members so they can complete profile and pay */}
            <Route path="dashboard/*" element={<MemberDashboard />} />
            <Route path="adhesion" element={<MemberAdhesion />} />
            <Route path="profil" element={<MemberProfile />} />
            
            {/* Strict Member Only Routes */}
            <Route path="annuaire" element={<RequireMembership><Directory /></RequireMembership>} />
            <Route path="annuaire/:id" element={<RequireMembership><DirectoryProfile /></RequireMembership>} />
            <Route path="entrepreneures" element={<Navigate to="annuaire" replace />} />
            <Route path="reseau" element={<RequireMembership><Placeholder title="Réseau" /></RequireMembership>} />
            <Route path="formations" element={<RequireMembership><Placeholder title="Formations" /></RequireMembership>} />
            <Route path="opportunites" element={<RequireMembership><Placeholder title="Opportunités" /></RequireMembership>} />
            <Route path="evenements" element={<RequireMembership><Placeholder title="Événements Hub" /></RequireMembership>} />
            
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Route>
        </Route>

        {/* Legacy Redirects */}
        <Route path="/dashboard" element={<Navigate to="/hub/dashboard" replace />} />
        <Route path="/espace-membre/*" element={<Navigate to="/hub/dashboard" replace />} />
        <Route path="/connexion" element={<Navigate to="/hub/connexion" replace />} />
        <Route path="/inscription" element={<Navigate to="/rejoindre" replace />} />

        {/* FAFE Public Site Layout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/entrepreneures" element={<PublicEntrepreneurs />} />
          <Route path="/dons" element={<Donation />} />
          <Route path="/rejoindre" element={<Join />} />
          <Route path="/dons/succes" element={<DonationSuccess />} />
          
          {/* Public Marketplace */}
          <Route path="/marketplace/*" element={<MarketplaceLayout />} />
          
          {/* Merged CMS Routes */}
          <Route path="/actualites" element={<NewsAndEvents />} />
          <Route path="/actualites/:slug" element={<ArticleDetail />} />
          <Route path="/evenements/:slug" element={<EventDetails />} />
          <Route path="/evenements/:slug/inscription" element={<EventRegistration />} />
          <Route path="/evenements/inscription/succes" element={<EventRegistrationSuccess />} />

          {/* Redirections for old actualités / événements routes */}
          <Route path="/actualites-evenements" element={<Navigate to="/actualites" replace />} />
          <Route path="/evenements" element={<Navigate to="/actualites" replace />} />
          <Route path="/actualites/categorie/:slug" element={<Navigate to="/actualites" replace />} />
          <Route path="/actualites/tag/:slug" element={<Navigate to="/actualites" replace />} />
          
          <Route path="/nous/*" element={<AboutAndActions />} />
          
          {/* Redirections for old nos actions / a propos routes */}
          <Route path="/a-propos/*" element={<Navigate to="/nous" replace />} />
          <Route path="/nos-actions" element={<Navigate to="/nous" replace />} />
          <Route path="/nos-actions/:slug" element={<Navigate to="/nous" replace />} />
          <Route path="/contact" element={<Navigate to="/nous#contact" replace />} />
          
          <Route path="/galerie/*" element={<Gallery />} />
          <Route path="/recherche" element={<Placeholder title="Recherche Globale" />} />
          
          {/* Events Verification Routes */}
          <Route path="/certificat/:certificateId" element={<CertificateVerification />} />
          <Route path="/verification/:token" element={<Placeholder title="Vérification de billet" />} />
          
          {/* Projects */}
          <Route path="/projets-sociaux" element={<ProjectsList />} />
          <Route path="/projets-sociaux/:slug" element={<ProjectDetail />} />
          
          {/* Misc */}
          <Route path="/pays" element={<Placeholder title="Pays membres" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
