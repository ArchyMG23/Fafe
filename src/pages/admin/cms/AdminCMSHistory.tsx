import { useState, useEffect } from 'react';
import { History, User, Clock, CheckCircle2, Save, FileText, Filter, ArrowRight, ShieldAlert, Loader2 } from 'lucide-react';
import { CMSAuditLog } from '../../../types';
import { fetchCMSAuditLogs } from '../../../lib/cms';

export function AdminCMSHistory() {
  const [logs, setLogs] = useState<CMSAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageFilter, setPageFilter] = useState<string>('ALL');

  useEffect(() => {
    loadLogs();
  }, [pageFilter]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const items = await fetchCMSAuditLogs(pageFilter === 'ALL' ? undefined : pageFilter);
      setLogs(items);
    } catch (err) {
      console.error("Error loading logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'PUBLISH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3" />
            Publication Officielle
          </span>
        );
      case 'SAVE_DRAFT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Save className="w-3 h-3" />
            Brouillon Enregistré
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 text-stone-700">
            {action}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-heading text-[#6B3E1E]">
            Historique & Audit des Modifications CMS
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Traçabilité complète des modifications éditoriales, brouillons et publications par les administrateurs.
          </p>
        </div>

        {/* Filter by Page */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-stone-400" />
          <select
            value={pageFilter}
            onChange={e => setPageFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E67E22] font-semibold text-stone-700"
          >
            <option value="ALL">Toutes les pages</option>
            <option value="accueil">Accueil</option>
            <option value="nous">Nous</option>
            <option value="actualites">Actualités</option>
            <option value="galerie">Galerie</option>
            <option value="dons">Dons</option>
            <option value="global">Global (Navbar/Footer)</option>
          </select>
        </div>
      </div>

      {/* Logs Timeline */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-stone-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#E67E22] mb-2" />
          <p className="text-sm">Chargement du journal d'audit...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <History className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="font-bold text-stone-700">Aucun historique d'audit pour le moment</p>
          <p className="text-xs text-stone-400 mt-1">
            Les actions d'enregistrement de brouillon et de publication seront automatiquement consignées ici.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="divide-y divide-stone-100">
            {logs.map((log) => (
              <div key={log.id} className="p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-stone-50/50 transition-colors">
                
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600 shrink-0 mt-0.5">
                    <User className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-[#6B3E1E]">
                        {log.adminName || log.adminEmail || 'Administrateur'}
                      </span>
                      {getActionBadge(log.action)}
                      <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-[#E67E22]/10 text-[#E67E22]">
                        Page : {log.page}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600">
                      {log.changesSummary || 'Mise à jour du contenu'}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-stone-400 mt-1.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(log.timestamp).toLocaleString('fr-FR')}
                      </span>
                      {log.previousVersion && log.newVersion && (
                        <span>
                          Version {log.previousVersion} → <strong className="text-stone-700">v{log.newVersion}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span className="text-[11px] font-mono text-stone-400 bg-stone-100 px-2 py-1 rounded">
                    ID: {log.id.slice(0, 10)}...
                  </span>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
