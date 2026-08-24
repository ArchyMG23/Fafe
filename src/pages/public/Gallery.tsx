import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Camera, Video, Mic, CalendarDays, MonitorPlay } from 'lucide-react';

const galleryTabs = [
  { path: "/galerie/photos", label: "Photos", icon: <Camera className="w-4 h-4 mr-2" /> },
  { path: "/galerie/videos", label: "Vidéos", icon: <Video className="w-4 h-4 mr-2" /> },
  { path: "/galerie/podcasts", label: "Podcasts", icon: <Mic className="w-4 h-4 mr-2" /> },
  { path: "/galerie/conferences", label: "Conférences", icon: <CalendarDays className="w-4 h-4 mr-2" /> },
  { path: "/galerie/webinaires", label: "Webinaires", icon: <MonitorPlay className="w-4 h-4 mr-2" /> },
];

function PlaceholderGallery({ title }: { title: string }) {
  return (
    <div className="bg-white p-12 text-center rounded-2xl border border-stone-200 shadow-sm mt-8">
      <h3 className="text-2xl font-bold font-heading text-stone-500 mb-2">{title}</h3>
      <p className="text-stone-400">Aucun média publié dans cette section pour le moment.</p>
    </div>
  );
}

export function Gallery() {
  const location = useLocation();

  return (
    <div className="bg-[#FAF9F6] min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-heading text-[#6B3E1E] mb-4">
            Médiathèque FAFE
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            Revivez nos événements en images, vidéos et audios.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {galleryTabs.map(tab => {
            const isActive = location.pathname.includes(tab.path);
            return (
              <Link 
                key={tab.path} 
                to={tab.path}
                className={`flex items-center px-6 py-3 rounded-full text-sm font-bold transition-colors ${
                  isActive ? 'bg-[#E67E22] text-white shadow-md' : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                {tab.icon} {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Dynamic Content */}
        <Routes>
          <Route path="/" element={<PlaceholderGallery title="Bienvenue dans la galerie" />} />
          <Route path="photos" element={<PlaceholderGallery title="Albums Photos" />} />
          <Route path="videos" element={<PlaceholderGallery title="Vidéothèque" />} />
          <Route path="podcasts" element={<PlaceholderGallery title="Podcasts FAFE" />} />
          <Route path="conferences" element={<PlaceholderGallery title="Conférences" />} />
          <Route path="webinaires" element={<PlaceholderGallery title="Webinaires" />} />
        </Routes>
      </div>
    </div>
  );
}
