import { AdminPageHeader } from '../../../components/admin/AdminPageHeader';

export function AdminMedia() {
  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Médiathèque"
        description="Gérez les fichiers, images et ressources."
      />
      <div className="bg-white p-12 text-center rounded-xl border border-stone-200">
        <h3 className="text-xl font-bold text-stone-500 mb-2">Médiathèque en construction</h3>
        <p className="text-stone-400">Le gestionnaire de médias complet sera disponible prochainement.</p>
      </div>
    </div>
  );
}
