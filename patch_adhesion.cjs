const fs = require('fs');
let code = fs.readFileSync('src/pages/dashboard/MemberAdhesion.tsx', 'utf8');

// Add imports
if (!code.includes('useSearchParams')) {
  code = code.replace("import { Link } from 'react-router-dom';", "import { Link, useSearchParams } from 'react-router-dom';");
}
if (!code.includes('PaymentService')) {
  code = code.replace("import { doc, updateDoc } from 'firebase/firestore';", "import { doc, updateDoc } from 'firebase/firestore';\nimport { PaymentService } from '../../services/payment';");
}

code = code.replace(
  "  const { language } = useLanguageStore();",
  `  const { language } = useLanguageStore();\n  const [searchParams] = useSearchParams();`
);

// We need to handle successful callback
code = code.replace(
  "  useEffect(() => {\n    loadData();\n  }, [user]);",
  `  useEffect(() => {
    loadData();
    const status = searchParams.get('status');
    const txRef = searchParams.get('tx_ref');
    if ((status === 'successful' || status === 'success') && txRef) {
      handleOnlinePaymentSuccess();
    }
  }, [user]);

  const handleOnlinePaymentSuccess = async () => {
    if (!user) return;
    try {
      const memberships = await getUserMemberships(user.uid);
      if (memberships.length > 0) {
        const mem = memberships[0];
        if (mem.status === 'AWAITING_PAYMENT') {
          await submitMembershipPayment(mem.id, 'Paiement en ligne Flutterwave', '');
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, { membershipStatus: 'PAYMENT_SUBMITTED' });
          setProfile({ ...userProfile, membershipStatus: 'PAYMENT_SUBMITTED' } as any);
          setMessage({ type: 'success', text: 'Paiement en ligne confirmé avec succès !' });
          loadData();
        }
      }
    } catch (e) {
      console.error(e);
    }
  };`
);

// Add the payment initiation button logic
code = code.replace(
  "  const handleSubmitPayment = async (e: React.FormEvent) => {",
  `  const handleOnlinePayment = async () => {
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
        membership.id
      );
      if (paymentInit.providerRedirectUrl) {
        // override redirect url to come back to this page
        const redirectUrl = new URL(paymentInit.providerRedirectUrl);
        // The service already sets the redirect url to /dons/succes. We need to pass a custom redirect url to the processPayment if possible.
        // I will update processPayment to take an optional redirectUrl parameter later, for now we will modify it directly.
        window.location.href = paymentInit.providerRedirectUrl;
      }
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Erreur lors de l\\'initialisation du paiement.' });
      setIsUploading(false);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {`
);

fs.writeFileSync('src/pages/dashboard/MemberAdhesion.tsx', code);
