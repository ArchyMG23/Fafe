import { AdminPageHeader } from '../../../components/admin/AdminPageHeader';

export function AdminComments() {
  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Modération des Commentaires"
        description="Gérez les interactions des utilisateurs."
      />
      <div className="bg-white p-12 text-center rounded-xl border border-stone-200">
        <h3 className="text-xl font-bold text-stone-500 mb-2">Aucun commentaire</h3>
        <p className="text-stone-400">Les commentaires publics n'ont pas encore généré d'activité.</p>
      </div>
    </div>
  );
}
