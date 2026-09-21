import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { FAFEEvent } from '../../../types';
import { DEMO_EVENTS } from '../../../lib/mockData';
import { Button } from '../../../components/ui/Button';
import { AdminPageHeader } from '../../../components/admin/AdminPageHeader';
import { DataTable, Column } from '../../../components/admin/DataTable';
import { Calendar, Plus, Edit, Trash2, ExternalLink, RefreshCw, MapPin, Globe } from 'lucide-react';

export function AdminEvents() {
  const [events, setEvents] = useState<FAFEEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'events'));
      const snap = await getDocs(q);
      let fetched = snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as FAFEEvent));

      if (fetched.length === 0) {
        // Auto-seed default events into Firestore
        for (const demo of DEMO_EVENTS) {
          try {
            await setDoc(doc(db, 'events', demo.id), {
              ...demo,
              createdAt: Date.now(),
              updatedAt: Date.now()
            });
            fetched.push(demo as unknown as FAFEEvent);
          } catch (seedErr) {
            console.warn("Could not seed event:", seedErr);
            fetched.push(demo as unknown as FAFEEvent);
          }
        }
      }

      fetched.sort((a, b) => (b.startDate || 0) - (a.startDate || 0));
      setEvents(fetched);
    } catch (error) {
      console.error("Error fetching events, fallback to defaults:", error);
      setEvents(DEMO_EVENTS as unknown as FAFEEvent[]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (event: FAFEEvent) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'événement "${event.title}" ?`)) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'events', event.id));
      await fetchEvents();
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Erreur lors de la suppression de l'événement.");
    }
  };

  const columns: Column<FAFEEvent>[] = [
    {
      header: 'Visuel',
      accessor: (e) => (
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
          <img 
            src={e.coverImage || "https://images.unsplash.com/photo-1540317580384-e5d43867caa6?auto=format&fit=crop&w=800&q=80"} 
            alt={e.title} 
            className="w-full h-full object-cover" 
          />
        </div>
      )
    },
    {
      header: 'Titre & Lieu',
      accessor: (e) => (
        <div>
          <span className="font-bold text-[#063F3A] block max-w-sm line-clamp-1">{e.title}</span>
          <div className="flex items-center gap-1 text-xs text-stone-500 mt-0.5">
            {e.online ? (
              <span className="text-[#C8102E] font-medium flex items-center gap-1">
                <Globe className="w-3 h-3" /> En ligne
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#00843D]" /> {e.city}, {e.country}
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      header: 'Date',
      accessor: (e) => {
        const d = new Date(e.startDate);
        return (
          <div className="text-xs">
            <span className="font-bold text-[#063F3A] block">{d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span className="text-stone-400">{d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        );
      }
    },
    {
      header: 'Statut',
      accessor: (e) => {
        if (e.status === 'REGISTRATION_OPEN') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">Inscriptions ouvertes</span>;
        if (e.status === 'PUBLISHED') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">Publié</span>;
        if (e.status === 'COMPLETED') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-stone-800">Terminé</span>;
        if (e.status === 'CANCELLED') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">Annulé</span>;
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">Brouillon</span>;
      }
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (e) => (
        <div className="flex items-center justify-end gap-1">
          <a
            href={`/evenements/${e.slug || e.id}`}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 text-stone-400 hover:text-[#063F3A] hover:bg-stone-100 rounded-lg transition-colors"
            title="Voir la page publique détaillée"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(`/admin/evenements/${e.id}`)} 
            className="text-[#00843D] hover:text-[#006A31] hover:bg-green-50 p-1.5"
            title="Modifier"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleDelete(e)} 
            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Gestion des Événements & Activités"
        description="Gérez les événements affichés sur la page d'accueil et leurs pages de présentation et d'inscription respectives."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={fetchEvents} className="text-stone-600 border-stone-300">
              <RefreshCw className="w-4 h-4 mr-2" /> Actualiser
            </Button>
            <Link to="/admin/evenements/nouveau">
              <Button className="bg-[#00843D] hover:bg-[#006A31] text-white">
                <Plus className="w-4 h-4 mr-2" /> Nouvel Événement
              </Button>
            </Link>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={events}
        loading={loading}
        keyExtractor={(e) => e.id}
        emptyMessage="Aucun événement trouvé."
      />
    </div>
  );
}
