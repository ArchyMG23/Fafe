const fs = require('fs');
let code = fs.readFileSync('src/pages/DonationSuccess.tsx', 'utf8');

code = code.replace(
  /const location = useLocation\(\);\n  const state = location\.state as \{ donationId\?: string; reference\?: string; email\?: string \} \| null;/g,
  `const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const urlDonationId = searchParams.get('donationId');
  const urlReference = searchParams.get('ref');
  
  const state = location.state as { donationId?: string; reference?: string; email?: string } | null;
  const donationId = state?.donationId || urlDonationId;
  const reference = state?.reference || urlReference;
  `
);

code = code.replace(/!state\?\.donationId/g, "!donationId");
code = code.replace(/state\.donationId/g, "donationId");
code = code.replace(/state\?\.reference/g, "reference");

fs.writeFileSync('src/pages/DonationSuccess.tsx', code);
