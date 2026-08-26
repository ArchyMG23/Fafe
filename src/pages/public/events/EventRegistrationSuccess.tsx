import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle2, Calendar, Download } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export function EventRegistrationSuccess() {
  const location = useLocation();
  const state = location.state as { reference: string, eventTitle: string } | null;

  if (!state) {
    return <Navigate to="/evenements" replace />;
  }

  return (
    <div className="bg-[#FAF9F6] min-h-[80vh] flex flex-col items-center justify-center py-20 px-4">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-stone-100 max-w-lg w-full text-center">
        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        
        <h1 className="text-3xl font-bold font-heading text-[#6B3E1E] mb-4">Inscription confirmée !</h1>
        
        <p className="text-stone-600 mb-8 text-lg">
          Merci pour votre inscription à <br/><span className="font-bold text-[#E67E22]">{state.eventTitle}</span>
        </p>
        
        <div className="bg-[#FAF9F6] p-6 rounded-2xl border border-stone-200 mb-8">
          <p className="text-sm text-stone-500 font-medium mb-1">Votre référence d'inscription</p>
          <p className="text-2xl font-bold font-mono text-[#6B3E1E] tracking-wider">{state.reference}</p>
        </div>

        <p className="text-sm text-stone-500 mb-8">
          Un email de confirmation contenant votre badge d'accès et le QR code vous sera envoyé très prochainement.
        </p>

        <div className="space-y-4">
          <Button variant="outline" className="w-full flex items-center justify-center gap-2 border-[#E67E22] text-[#E67E22] hover:bg-[#E67E22]/5">
            <Calendar className="w-4 h-4" /> Ajouter à mon agenda
          </Button>
          <Link to="/hub/dashboard/evenements" className="block">
            <Button className="w-full bg-[#6B3E1E] hover:bg-[#522d14] text-white">
              Voir mes billets
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
