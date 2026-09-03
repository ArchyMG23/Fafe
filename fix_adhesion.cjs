const fs = require('fs');
let code = fs.readFileSync('src/pages/dashboard/MemberAdhesion.tsx', 'utf8');

// Replace everything between the first "const handleOnlinePayment" and "const handleSubmitPayment" with just the correct one
const firstHandle = "  const handleOnlinePayment = async () => {";
const handleSubmit = "  const handleSubmitPayment = async (e: React.FormEvent) => {";

const startIndex = code.indexOf(firstHandle);
const endIndex = code.indexOf(handleSubmit);

const correctHandle = `  const handleOnlinePayment = async () => {
    if (!membership || !userProfile) return;
    setIsUploading(true);
    try {
      const paymentInit = await PaymentService.processPayment(
        50000,
        'XAF',
        'FLUTTERWAVE',
        'ONE_TIME',
        { 
          name: \`\${userProfile.firstName} \${userProfile.lastName}\`, 
          email: userProfile.email,
          phone: userProfile.phone || ''
        },
        membership.id,
        \`\${window.location.origin}/dashboard/adhesion\`
      );
      if (paymentInit.providerRedirectUrl) {
        window.location.href = paymentInit.providerRedirectUrl;
      }
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Erreur lors de l\\'initialisation du paiement.' });
      setIsUploading(false);
    }
  };

`;

if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + correctHandle + code.substring(endIndex);
}

code = code.replace(
  "  const { language } = useLanguageStore();\n  const [searchParams] = useSearchParams();\n  const [searchParams] = useSearchParams();",
  "  const { language } = useLanguageStore();\n  const [searchParams] = useSearchParams();"
);

// One more check in case it's declared slightly differently
code = code.replace(
  "  const [searchParams] = useSearchParams();\n  const [searchParams] = useSearchParams();",
  "  const [searchParams] = useSearchParams();"
);

code = code.replace(/const \[searchParams\] = useSearchParams\(\);\s+const \[searchParams\] = useSearchParams\(\);/g, "const [searchParams] = useSearchParams();");
fs.writeFileSync('src/pages/dashboard/MemberAdhesion.tsx', code);
