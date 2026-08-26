import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchProjects } from '../../lib/dataFetching';
import { Project } from '../../types';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Loader2, ArrowRight } from 'lucide-react';

export function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchProjects();
      setProjects(data);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <Loader2 className="w-12 h-12 border-4 border-[#E67E22]/20 border-t-[#E67E22] rounded-full animate-spin mb-4" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-32">
      <div className="container mx-auto px-4 md:px-6">
        <h1 className="text-4xl md:text-5xl font-bold font-heading text-[#6B3E1E] mb-12 text-center">
          Projets Sociaux
        </h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow bg-white rounded-2xl group flex flex-col">
              <div className="relative h-64 overflow-hidden">
                <img
                  src={project.image || "https://images.unsplash.com/photo-1593113563332-ba78c9d115e4?auto=format&fit=crop&q=80&w=600"}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <CardContent className="p-8 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold font-heading text-[#6B3E1E] mb-4">
                  {project.title}
                </h3>
                <p className="text-stone-600 mb-8 line-clamp-3">
                  {project.description}
                </p>
                <div className="mt-auto">
                  <Link to={`/projets-sociaux/${project.id}`}>
                    <Button variant="outline" className="w-full border-[#6B3E1E]/20 text-[#6B3E1E] hover:bg-[#6B3E1E] hover:text-white rounded-full">
                      En savoir plus
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
