import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ShieldCheck, MapPin, Heart, Briefcase, ArrowRight } from 'lucide-react';

export function DashboardOverview() {
  const { userProfile } = useAuthStore();

  if (!userProfile) return null;

  return (
    <div className="space-y-6 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <Card className="border-0 shadow-sm bg-white w-full">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-xl shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#6B3E1E]/60 truncate">Statut du compte</p>
                <p className="text-lg font-bold text-[#6B3E1E] truncate">{userProfile.status}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-white w-full">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-50 text-[#E67E22] rounded-xl shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#6B3E1E]/60 truncate">Pays</p>
                <p className="text-lg font-bold text-[#6B3E1E] truncate">{userProfile.country || 'Non renseigné'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-white w-full">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-50 text-rose-500 rounded-xl shrink-0">
                <Heart className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#6B3E1E]/60 truncate">Dons réalisés</p>
                <p className="text-lg font-bold text-[#6B3E1E] truncate">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-white w-full">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-stone-50 text-stone-500 rounded-xl shrink-0">
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#6B3E1E]/60 truncate">Profil Pro</p>
                <p className="text-lg font-bold text-[#6B3E1E] truncate">Aucun</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-[#E67E22]/20 shadow-sm bg-orange-50 w-full">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-xl font-bold font-heading text-[#6B3E1E] mb-2">
                Vous êtes entrepreneure ? Créez votre profil professionnel.
              </h3>
              <p className="text-[#6B3E1E]/70 max-w-2xl">
                Rejoignez l'annuaire panafricain pour augmenter votre visibilité, trouver des partenaires et développer votre réseau sur tout le continent.
              </p>
            </div>
            <Link to="/hub/dashboard/entrepreneure">
              <Button className="bg-[#E67E22] hover:bg-[#c96a1a] text-white whitespace-nowrap shadow-md rounded-xl font-bold">
                Créer mon profil <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
