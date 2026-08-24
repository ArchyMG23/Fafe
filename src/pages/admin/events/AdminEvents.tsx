import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Calendar, Plus, Users, QrCode } from 'lucide-react';

export function AdminEvents() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-heading text-[#6B3E1E]">Événements</h1>
          <p className="text-stone-500">Gérez vos événements, participants et présences.</p>
        </div>
        <Link to="/admin/evenements/nouveau">
          <Button className="bg-[#E67E22] hover:bg-[#c96a1a] text-white">
            <Plus className="w-4 h-4 mr-2" /> Créer un événement
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="p-8 text-center text-stone-500">
          <Calendar className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <p>Le module de gestion des événements est opérationnel (interface en cours de finalisation).</p>
        </div>
      </div>
    </div>
  );
}
