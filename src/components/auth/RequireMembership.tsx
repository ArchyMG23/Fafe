import { useAuthStore } from '../../store/auth';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { ShieldAlert, ArrowLeft, Clock, AlertTriangle, CreditCard, CheckCircle } from 'lucide-react';

export function RequireMembership({ children }: { children: React.ReactNode }) {
  const { userProfile } = useAuthStore();
  const navigate = useNavigate();

  // Admins bypass this block (except if you want them to have membership too, but usually admins can see everything)
  const isMember = userProfile?.membershipStatus === 'ACTIVE' || 
                   userProfile?.role === 'ADMIN' || 
                   userProfile?.role === 'SUPER_ADMIN';

  if (!isMember) {
    const status = userProfile?.membershipStatus;

    let content = {
      title: 'Accès Réservé',
      description: 'Cette fonctionnalité est réservée aux membres FAFE. Pour accéder à l\'annuaire, au réseau et aux opportunités, veuillez valider votre adhésion.',
      buttonText: 'Devenir membre',
      icon: <ShieldAlert className="w-10 h-10 text-[#E67E22]" />
    };

    if (status === 'AWAITING_PAYMENT') {
      content = {
        title: 'Paiement Requis',
        description: 'Veuillez finaliser votre adhésion en transmettant votre preuve de paiement.',
        buttonText: 'Finaliser mon adhésion',
        icon: <CreditCard className="w-10 h-10 text-orange-500" />
      };
    } else if (status === 'PAYMENT_SUBMITTED') {
      content = {
        title: 'Paiement en vérification',
        description: 'Votre paiement est en cours de vérification. L\'équipe FAFE traitera votre dossier sous peu.',
        buttonText: 'Voir mon dossier',
        icon: <Clock className="w-10 h-10 text-blue-500" />
      };
    } else if (status === 'UNDER_REVIEW') {
      content = {
        title: 'Examen en cours',
        description: 'Votre demande est actuellement examinée par notre comité.',
        buttonText: 'Voir mon dossier',
        icon: <Clock className="w-10 h-10 text-purple-500" />
      };
    } else if (status === 'REJECTED') {
      content = {
        title: 'Action Requise',
        description: 'Votre demande nécessite une action ou a été rejetée. Veuillez consulter les détails.',
        buttonText: 'Consulter mon dossier',
        icon: <AlertTriangle className="w-10 h-10 text-red-500" />
      };
    } else if (status === 'EXPIRED') {
      content = {
        title: 'Adhésion Expirée',
        description: 'Votre adhésion doit être renouvelée pour continuer à profiter des avantages membres.',
        buttonText: 'Renouveler mon adhésion',
        icon: <Clock className="w-10 h-10 text-stone-500" />
      };
    }

    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-[#6B3E1E]/10">
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
            {content.icon}
          </div>
          
          <h2 className="text-2xl font-bold font-heading text-[#6B3E1E] mb-4">
            {content.title}
          </h2>
          
          <p className="text-stone-600 mb-8 leading-relaxed">
            {content.description}
          </p>
          
          <div className="flex flex-col gap-3">
            <Link to="/hub/adhesion">
              <Button className="w-full bg-[#E67E22] hover:bg-[#c96a1a] text-white py-6 rounded-xl font-bold">
                {content.buttonText}
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="w-full border-2 border-stone-200 text-stone-700 hover:bg-stone-50 py-6 rounded-xl font-bold"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
