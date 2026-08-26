const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add HubLayout import
content = content.replace(
  /import \{ Footer \} from '\.\/components\/layout\/Footer';/,
  "import { Footer } from './components/layout/Footer';\nimport { HubLayout } from './components/layout/HubLayout';\nimport { PublicEntrepreneurs } from './pages/public/PublicEntrepreneurs';"
);

// We want to completely replace the Routes block to be safe.
const targetRoutesStart = content.indexOf('<Routes>');
const targetRoutesEnd = content.indexOf('</Routes>') + '</Routes>'.length;

const newRoutes = `<Routes>
        {/* Admin Layout (No public navbar/footer) */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'CONTENT_MANAGER', 'FINANCE_MANAGER']} />}>
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Route>

        {/* FAFE HUB (Private/Operational Platform) */}
        <Route path="/hub" element={<HubLayout />}>
          {/* Public Hub Routes */}
          <Route path="connexion" element={<Login />} />
          <Route path="inscription" element={<Register />} />
          <Route path="mot-de-passe-oublie" element={<ForgotPassword />} />
          <Route index element={<Navigate to="/hub/connexion" replace />} />
          
          {/* Protected Hub Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="dashboard/*" element={<MemberDashboard />} />
            <Route path="annuaire" element={<Directory />} />
            <Route path="annuaire/:id" element={<DirectoryProfile />} />
            <Route path="entrepreneures" element={<Navigate to="annuaire" replace />} />
            <Route path="reseau" element={<Placeholder title="Réseau" />} />
            <Route path="formations" element={<Placeholder title="Formations" />} />
            <Route path="opportunites" element={<Placeholder title="Opportunités" />} />
            <Route path="evenements" element={<Placeholder title="Événements Hub" />} />
            <Route path="marketplace" element={<Placeholder title="Marketplace" />} />
            <Route path="dons" element={<Placeholder title="Mes Dons" />} />
            <Route path="profil" element={<Placeholder title="Mon Profil" />} />
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
          
          {/* Public CMS Routes */}
          <Route path="/actualites" element={<News />} />
          <Route path="/actualites/:slug" element={<ArticleDetail />} />
          <Route path="/actualites/categorie/:slug" element={<News />} />
          <Route path="/actualites/tag/:slug" element={<News />} />
          <Route path="/a-propos/*" element={<About />} />
          <Route path="/galerie/*" element={<Gallery />} />
          <Route path="/recherche" element={<Placeholder title="Recherche Globale" />} />
          
          {/* Events Routes */}
          <Route path="/evenements" element={<EventList />} />
          <Route path="/evenements/:slug" element={<EventDetails />} />
          <Route path="/evenements/:slug/inscription" element={<EventRegistration />} />
          <Route path="/evenements/inscription/succes" element={<EventRegistrationSuccess />} />
          <Route path="/certificat/:certificateId" element={<CertificateVerification />} />
          <Route path="/verification/:token" element={<Placeholder title="Vérification de billet" />} />
          
          {/* Action Routes */}
          <Route path="/nos-actions" element={<Actions />} />
          <Route path="/nos-actions/:slug" element={<Actions />} />
          <Route path="/projets-sociaux" element={<ProjectsList />} />
          <Route path="/projets-sociaux/:slug" element={<ProjectDetail />} />
          
          {/* Misc */}
          <Route path="/pays" element={<Placeholder title="Pays membres" />} />
          <Route path="/contact" element={<Placeholder title="Contact" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>`;

content = content.substring(0, targetRoutesStart) + newRoutes + content.substring(targetRoutesEnd);
fs.writeFileSync('src/App.tsx', content);
