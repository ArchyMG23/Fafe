const fs = require('fs');
let code = fs.readFileSync('src/pages/dashboard/MemberAdhesion.tsx', 'utf8');

code = code.replace(
  "membership.id\n      );",
  "membership.id,\n        \`\${window.location.origin}/dashboard/adhesion\`\n      );"
);

// Add the button to the UI
const buttonUI = `
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                  <h3 className="font-bold text-[#6B3E1E] mb-4">Paiement en ligne sécurisé</h3>
                  <p className="text-sm text-stone-600 mb-4">
                    Réglez votre cotisation annuelle (50 000 FCFA) par carte bancaire ou Mobile Money via Flutterwave.
                  </p>
                  <Button onClick={handleOnlinePayment} disabled={isUploading} className="w-full bg-[#E67E22] hover:bg-[#c96a1a] text-white">
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />}
                    Payer l'adhésion en ligne
                  </Button>
                </div>

                <div className="relative flex py-4 items-center">
                  <div className="flex-grow border-t border-stone-300"></div>
                  <span className="flex-shrink-0 mx-4 text-stone-400 text-sm font-medium">OU paiement manuel</span>
                  <div className="flex-grow border-t border-stone-300"></div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
`;

code = code.replace(
  '<div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">\n                  <h3 className="font-bold text-[#6B3E1E] mb-4">Transmettre la preuve de paiement</h3>',
  buttonUI + '                  <h3 className="font-bold text-[#6B3E1E] mb-4">Transmettre la preuve de paiement bancaire</h3>'
);

fs.writeFileSync('src/pages/dashboard/MemberAdhesion.tsx', code);
