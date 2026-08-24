import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { DataTable, Column } from '../../components/admin/DataTable';
import { ShieldAlert } from 'lucide-react';

export function AdminAudit() {
  const columns: Column<any>[] = [
    { header: 'Date', accessor: 'date' },
    { header: 'Utilisateur', accessor: 'user' },
    { header: 'Action', accessor: 'action' },
    { header: 'Ressource', accessor: 'resource' },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Journal d'Audit"
        description="Traçabilité des actions administratives (consultation seule)."
      />
      <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl flex items-center gap-3 text-sm">
        <ShieldAlert className="w-5 h-5 shrink-0" />
        Cette fonctionnalité sera connectée à la base de données Firestore dans une prochaine version.
      </div>
      <DataTable
        columns={columns}
        data={[]}
        loading={false}
        keyExtractor={(item) => item.id}
        emptyMessage="Aucune entrée d'audit."
      />
    </div>
  );
}
