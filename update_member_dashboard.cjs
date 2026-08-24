const fs = require('fs');
let content = fs.readFileSync('src/pages/dashboard/MemberDashboard.tsx', 'utf8');

const importAdhesion = `import { MemberAdhesion } from './MemberAdhesion';\nimport { ShieldCheck } from 'lucide-react';`;
content = content.replace("import { MemberEvents } from './events/MemberEvents';", `${importAdhesion}\nimport { MemberEvents } from './events/MemberEvents';`);

const navLink = `<Link to="/espace-membre/adhesion">
                  <Button variant="ghost" className={getLinkClass('/espace-membre/adhesion')}>
                    <ShieldCheck className="w-4 h-4 mr-3" /> Mon adhésion
                  </Button>
                </Link>`;

content = content.replace("<Link to=\"/espace-membre/dons\">", `${navLink}\n                <Link to="/espace-membre/dons">`);

const routeAdhesion = `<Route path="/adhesion" element={<MemberAdhesion />} />`;
content = content.replace('<Route path="/dons" element={<DonationHistory />} />', `<Route path="/adhesion" element={<MemberAdhesion />} />\n              <Route path="/dons" element={<DonationHistory />} />`);

fs.writeFileSync('src/pages/dashboard/MemberDashboard.tsx', content);
