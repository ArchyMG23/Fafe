const fs = require('fs');
let code = fs.readFileSync('src/pages/DonationSuccess.tsx', 'utf8');

// Also extract 'status' from searchParams
code = code.replace(
  "const urlReference = searchParams.get('ref');",
  "const urlReference = searchParams.get('ref');\n  const status = searchParams.get('status');"
);

code = code.replace(
  "const [donation, setDonation] = useState<Donation | null>(null);",
  `const [donation, setDonation] = useState<Donation | null>(null);
  const [paymentStatusParam] = useState(searchParams.get('status'));`
);

code = code.replace(
  "donation?.paymentStatus === 'SUCCESS'",
  "(donation?.paymentStatus === 'SUCCESS' || paymentStatusParam === 'successful' || paymentStatusParam === 'success')"
);

fs.writeFileSync('src/pages/DonationSuccess.tsx', code);
