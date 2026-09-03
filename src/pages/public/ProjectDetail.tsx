import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProjects } from '../../lib/dataFetching';
import { Project } from '../../types';
import { Button } from '../../components/ui/Button';
import { Loader2, ArrowLeft } from 'lucide-react';

export function ProjectDetail() {
  const { slug } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchProjects();
      const match = data.find(p => p.id === slug || p.id === slug);
      setProject(match || null);
      setLoading(false);
    };
    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <Loader2 className="w-12 h-12 border-4 border-[#E67E22]/20 border-t-[#E67E22] rounded-full animate-spin mb-4" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF9F6] text-center px-4">
        <h1 className="text-3xl font-bold font-heading text-[#6B3E1E] mb-4">Projet introuvable</h1>
        <p className="text-stone-600 mb-8">Ce contenu n'est pas disponible pour le moment.</p>
        <Link to="/projets-sociaux">
          <Button className="bg-[#E67E22] hover:bg-[#c96a1a] text-white rounded-full">
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux projets
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-32">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 max-w-4xl">
        <Link to="/projets-sociaux" className="inline-flex items-center text-[#E67E22] hover:text-[#c96a1a] font-medium mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux projets
        </Link>
        
        <img
          src={project.image || "https://images.unsplash.com/photo-1593113563332-ba78c9d115e4?auto=format&fit=crop&q=80&w=1200"}
          alt={project.title}
          className="w-full h-64 md:h-[400px] object-cover rounded-3xl shadow-xl mb-12"
        />
        
        <h1 className="text-4xl md:text-5xl font-bold font-heading text-[#6B3E1E] mb-6">
          {project.title}
        </h1>
        
        <div className="prose prose-lg prose-stone max-w-none">
          <p className="text-xl text-stone-600 leading-relaxed mb-8">
            {project.description}
          </p>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#6B3E1E]/5 mb-8">
            <h2 className="text-2xl font-bold font-heading text-[#6B3E1E] mb-4">Objectifs</h2>
            {Array.isArray(project.objectives) ? <ul className="list-disc pl-5 text-stone-600">{project.objectives.map((obj, i) => <li key={i}>{obj}</li>)}</ul> : <div className="text-stone-600 whitespace-pre-wrap">{project.objectives}</div>}
          </div>
          
          {project.impact && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#6B3E1E]/5">
              <h2 className="text-2xl font-bold font-heading text-[#6B3E1E] mb-4">Résultats attendus / obtenus</h2>
              <div className="text-stone-600 whitespace-pre-wrap">{project.impact}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
