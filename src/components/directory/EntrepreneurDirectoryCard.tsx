import { Link } from 'react-router-dom';
import { MapPin, ShieldCheck } from 'lucide-react';
import { Entrepreneur } from '../../types';
import { FafeImage } from '../ui/FafeImage';

export interface EntrepreneurDirectoryCardProps {
  entrepreneur: Entrepreneur;
  priority?: boolean;
  linkTo?: string;
  className?: string;
}

export function EntrepreneurDirectoryCard({
  entrepreneur,
  priority = false,
  linkTo,
  className = '',
}: EntrepreneurDirectoryCardProps) {
  const targetLink = linkTo || `/hub/annuaire/${entrepreneur.id}`;

  return (
    <Link
      to={targetLink}
      className={`group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00843D] rounded-2xl ${className}`}
      id={`entrepreneur-card-${entrepreneur.id}`}
    >
      <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-md transition-shadow duration-300">
        {/* 1. IMAGE: Conteneur responsive, ratio stable, sans zoom excessif, priorité absolue au visage */}
        <div className="relative w-full overflow-hidden bg-stone-100 rounded-t-2xl aspect-[4/3.8] max-h-64 sm:max-h-72">
          <FafeImage
            src={entrepreneur.professionalPhoto}
            alt={`${entrepreneur.firstName} ${entrepreneur.lastName}`}
            fallbackType="person"
            priority={priority}
            objectPosition="50% 10%"
            imageClassName="w-full h-full object-cover object-[50%_10%]"
            className="w-full h-full"
          />

          {/* Badge Profil Vérifié */}
          {entrepreneur.verificationStatus === 'VERIFIED' && (
            <div className="absolute top-2.5 right-2.5 z-10">
              <span
                className="inline-flex items-center gap-1 bg-[#D4AF37] text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs"
                title="Profil vérifié FAFE"
              >
                <ShieldCheck className="w-3 h-3" />
                <span className="hidden xs:inline">Vérifié</span>
              </span>
            </div>
          )}
        </div>

        {/* 2. CONTENU DE LA CARTE:
            Structure compacte et ordonnée selon la spécification :
            IMAGE -> Pays -> Nom -> Entreprise -> Courte description
        */}
        <div className="p-4 sm:p-5 flex flex-col flex-grow bg-white">
          {/* Pays */}
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#00843D] uppercase tracking-wider mb-1">
            <MapPin className="w-3.5 h-3.5 text-[#00843D] shrink-0" />
            <span className="truncate">{entrepreneur.country}</span>
          </div>

          {/* Nom */}
          <h3 className="text-base sm:text-lg font-bold font-heading text-[#063F3A] leading-snug group-hover:text-[#00843D] transition-colors truncate">
            {entrepreneur.firstName} {entrepreneur.lastName}
          </h3>

          {/* Entreprise */}
          <p className="text-xs font-bold text-[#D4AF37] mt-0.5 mb-2 truncate">
            {entrepreneur.company || entrepreneur.position || 'Entrepreneure FAFE'}
          </p>

          {/* Courte description avec limitation ellipsis propre sur mobile */}
          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mt-auto">
            {entrepreneur.description ||
              (entrepreneur.expertise && entrepreneur.expertise.length > 0
                ? entrepreneur.expertise.join(', ')
                : 'Membre active du réseau FAFE.')}
          </p>
        </div>
      </div>
    </Link>
  );
}
