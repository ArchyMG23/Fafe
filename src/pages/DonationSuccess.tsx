import { Link, useLocation, Navigate } from 'react-router-dom';
import { CheckCircle2, Download, Heart } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

export function DonationSuccess() {
  const location = useLocation();
  const data = location.state;

  if (!data) {
    return <Navigate to="/dons" replace />;
  }

  const date = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-12 flex items-center">
      <div className="container mx-auto px-4 md:px-6 max-w-2xl">
        <Card className="border-0 shadow-xl overflow-hidden">
          <div className="bg-[#00843D] p-8 text-center text-white">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 mb-6">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold font-heading mb-2">Merci pour votre générosité !</h1>
            <p className="text-green-50">Votre don a été traité avec succès.</p>
          </div>
          
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <Heart className="w-8 h-8 text-[#E67E22] mx-auto mb-3" />
              <p className="text-stone-600">
                Grâce à votre soutien, le FAFE continue de bâtir un écosystème fort pour les femmes entrepreneures en Afrique.
              </p>
            </div>

            <div className="bg-stone-50 rounded-xl p-6 border border-stone-100 mb-8">
              <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4 border-b border-stone-200 pb-2">
                Détails de la transaction
              </h3>
              
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-stone-500">Montant</dt>
                  <dd className="font-bold text-[#6B3E1E] text-lg">{data.amount.toLocaleString('fr-FR')} FCFA</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-stone-500">Type de don</dt>
                  <dd className="font-medium text-stone-800">{data.type === 'RECURRING' ? 'Mensuel' : 'Ponctuel'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-stone-500">N° Transaction</dt>
                  <dd className="font-mono text-stone-800">{data.transactionId}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-stone-500">Date</dt>
                  <dd className="text-stone-800">{date}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-stone-500">Statut</dt>
                  <dd className="font-medium text-[#00843D]">Réussi (SUCCESS)</dd>
                </div>
              </dl>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="flex-1 gap-2" disabled>
                <Download className="w-4 h-4" />
                Télécharger le reçu (Bientôt)
              </Button>
              <Link to="/" className="flex-1">
                <Button className="w-full">Retour à l'accueil</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
