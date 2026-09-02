import { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Camera, Video, Mic, CalendarDays, MonitorPlay, Play, ExternalLink, Sparkles } from 'lucide-react';
import { FafeImage } from '../../components/ui/FafeImage';

const galleryTabs = [
  { path: "/galerie/photos", label: "Photos", icon: <Camera className="w-4 h-4 mr-2" /> },
  { path: "/galerie/videos", label: "Vidéos", icon: <Video className="w-4 h-4 mr-2" /> },
  { path: "/galerie/podcasts", label: "Podcasts", icon: <Mic className="w-4 h-4 mr-2" /> },
  { path: "/galerie/conferences", label: "Conférences", icon: <CalendarDays className="w-4 h-4 mr-2" /> },
  { path: "/galerie/webinaires", label: "Webinaires", icon: <MonitorPlay className="w-4 h-4 mr-2" /> },
];

const DEMO_PHOTOS = [
  {
    title: "Cérémonie d'ouverture du Sommet FAFE Dakar",
    date: "Mars 2024",
    location: "Dakar, Sénégal",
    image: "https://images.unsplash.com/photo-1540317580384-e5d43867caa6?auto=format&fit=crop&q=80&w=800",
    category: "Sommet FAFE"
  },
  {
    title: "Atelier Pitch & Levée de Fonds pour Entrepreneures",
    date: "Février 2024",
    location: "Abidjan, Côte d'Ivoire",
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32d7?auto=format&fit=crop&q=80&w=800",
    category: "Masterclass"
  },
  {
    title: "Rencontre des Lauréates du Programme Accélération Tech",
    date: "Janvier 2024",
    location: "Kigali, Rwanda",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
    category: "Incubation"
  },
  {
    title: "Exposition Artisanat & Innovation Agroalimentaire",
    date: "Novembre 2023",
    location: "Cotonou, Bénin",
    image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=800",
    category: "Marketplace & Expo"
  },
  {
    title: "Session Plénière : Leadership Féminin et ZLECAf",
    date: "Octobre 2023",
    location: "Lomé, Togo",
    image: "https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&q=80&w=800",
    category: "Conférence"
  },
  {
    title: "Remise des Trophées de l'Excellence Féminine",
    date: "Septembre 2023",
    location: "Yaoundé, Cameroun",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800",
    category: "Gala & Récompenses"
  }
];

const DEMO_VIDEOS = [
  {
    title: "Rétrospective du Forum Panafricain FAFE",
    duration: "14:20",
    speaker: "Délégations de 15 pays",
    thumbnail: "https://images.unsplash.com/photo-1540317580384-e5d43867caa6?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Parcours inspirant : De l'idée à une chaîne agroalimentaire",
    duration: "08:45",
    speaker: "Témoignage membre FAFE",
    thumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Masterclass Replay : Négocier avec les institutions bancaires",
    duration: "45:10",
    speaker: "Pôle Financement FAFE",
    thumbnail: "https://images.unsplash.com/photo-1556761175-5973dc0f32d7?auto=format&fit=crop&q=80&w=800"
  }
];

const DEMO_PODCASTS = [
  {
    title: "Épisode 12 : Les clés du financement d'amorçage en Afrique",
    duration: "32 min",
    guest: "Experte Capital-Risque FAFE",
    date: "15 Fév 2024"
  },
  {
    title: "Épisode 11 : Concilier expansion internationale et ancrage local",
    duration: "28 min",
    guest: "Fondatrice & Dirigeante PME",
    date: "01 Fév 2024"
  },
  {
    title: "Épisode 10 : Numériser son activité artisanale sans se ruiner",
    duration: "25 min",
    guest: "Consultante Transformation Digitale",
    date: "18 Jan 2024"
  }
];

function PhotoGallery() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold font-heading text-[#6B3E1E]">Albums Photos Événements</h2>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-semibold">
          <Sparkles className="w-3 h-3 text-[#E67E22]" /> Données de démonstration
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DEMO_PHOTOS.map((photo, i) => (
          <div key={i} className="group bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="relative h-56 overflow-hidden bg-stone-100">
              <FafeImage src={photo.image} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                {photo.category}
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-[#6B3E1E] text-base mb-2 group-hover:text-[#E67E22] transition-colors line-clamp-2">
                {photo.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>{photo.location}</span>
                <span className="font-medium text-stone-400">{photo.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VideoGallery() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold font-heading text-[#6B3E1E]">Vidéothèque & Replays</h2>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-semibold">
          <Sparkles className="w-3 h-3 text-[#E67E22]" /> Données de démonstration
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {DEMO_VIDEOS.map((vid, i) => (
          <div key={i} className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-all">
            <div className="relative h-48 bg-stone-900 group cursor-pointer">
              <FafeImage src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-[#E67E22] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 ml-0.5" fill="white" />
                </div>
              </div>
              <span className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-2 py-0.5 rounded font-mono">
                {vid.duration}
              </span>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-[#6B3E1E] text-base mb-1">{vid.title}</h3>
              <p className="text-xs text-stone-500">{vid.speaker}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PodcastGallery() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold font-heading text-[#6B3E1E]">Podcasts : Voix de Femmes Panafricaines</h2>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-semibold">
          <Sparkles className="w-3 h-3 text-[#E67E22]" /> Données de démonstration
        </span>
      </div>
      <div className="space-y-4">
        {DEMO_PODCASTS.map((pod, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#E67E22]/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E67E22]/10 text-[#E67E22] flex items-center justify-center shrink-0">
                <Mic className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-[#6B3E1E] text-base">{pod.title}</h3>
                <p className="text-xs text-stone-500 mt-0.5">{pod.guest} • {pod.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 self-end md:self-center">
              <span className="text-xs font-mono text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">{pod.duration}</span>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-[#6B3E1E] hover:bg-[#522f16] text-white rounded-xl text-xs font-bold transition-colors">
                <Play className="w-3.5 h-3.5" fill="white" /> Écouter
              </button>
            </div>
          </div>
        ))}
      </div>
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
            Revivez nos événements en images, vidéos et audios. Découvrez les moments forts de l'entrepreneuriat féminin en Afrique.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {galleryTabs.map(tab => {
            const isRoot = location.pathname === '/galerie' && tab.path === '/galerie/photos';
            const isActive = location.pathname.startsWith(tab.path) || isRoot;
            return (
              <Link 
                key={tab.path} 
                to={tab.path}
                className={`flex items-center px-6 py-3 rounded-full text-sm font-bold transition-all ${
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
          <Route path="/" element={<PhotoGallery />} />
          <Route path="photos" element={<PhotoGallery />} />
          <Route path="videos" element={<VideoGallery />} />
          <Route path="podcasts" element={<PodcastGallery />} />
          <Route path="conferences" element={<PhotoGallery />} />
          <Route path="webinaires" element={<VideoGallery />} />
        </Routes>
      </div>
    </div>
  );
}

