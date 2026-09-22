import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MapPin, Briefcase, Search, ArrowRight, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { FafeImage } from '../components/ui/FafeImage';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Entrepreneur } from '../types';
import { AFRICAN_COUNTRIES, SECTORS } from '../lib/constants';
import { fetchEntrepreneurs } from '../lib/dataFetching';
import { EntrepreneurDirectoryCard } from '../components/directory/EntrepreneurDirectoryCard';

export function Directory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [entrepreneurs, setEntrepreneurs] = useState<Entrepreneur[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [countryFilter, setCountryFilter] = useState(searchParams.get('country') || '');
  const [sectorFilter, setSectorFilter] = useState(searchParams.get('sector') || '');
  const [cityFilter, setCityFilter] = useState(searchParams.get('city') || '');
  
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchEntrepreneurs();
      setEntrepreneurs(data);
      setLoading(false);
    };
    loadData();
  }, []);

  // Sync state back to URL parameters when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (countryFilter) params.set('country', countryFilter);
    if (sectorFilter) params.set('sector', sectorFilter);
    if (cityFilter) params.set('city', cityFilter);
    setSearchParams(params, { replace: true });
  }, [searchTerm, countryFilter, sectorFilter, cityFilter, setSearchParams]);

  // Extract unique cities from loaded entrepreneurs for city filter
  const cities = Array.from(new Set(entrepreneurs.map(e => e.city))).filter(Boolean);

  const filteredEntrepreneurs = entrepreneurs.filter(e => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (e.firstName || '').toLowerCase().includes(searchLower) || 
      (e.lastName || '').toLowerCase().includes(searchLower) ||
      (e.company || '').toLowerCase().includes(searchLower) ||
      (e.expertise || []).some(exp => exp.toLowerCase().includes(searchLower)) ||
      (e.productsServices || []).some(ps => ps.toLowerCase().includes(searchLower));
      
    const matchesCountry = countryFilter ? e.country === countryFilter : true;
    const matchesSector = sectorFilter ? e.sector === sectorFilter : true;
    const matchesCity = cityFilter ? e.city === cityFilter : true;
    
    return matchesSearch && matchesCountry && matchesSector && matchesCity;
  });

  const getCountryName = (code: string) => {
    const country = AFRICAN_COUNTRIES.find(c => c.code === code || c.name === code);
    return country ? country.name : code;
  };

  const getSectorName = (id: string) => {
    const sector = SECTORS.find(s => s.id === id || s.name === id);
    return sector ? sector.name : id;
  };

  const resetFilters = () => {
    setSearchTerm('');
    setCountryFilter('');
    setSectorFilter('');
    setCityFilter('');
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-16">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Header */}
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <h2 className="text-sm font-bold tracking-widest text-[#00843D] uppercase mb-4">Annuaire Panafricain</h2>
          <h1 className="text-3xl md:text-5xl font-bold font-heading text-[#063F3A] mb-6 leading-tight">
            Les femmes qui entreprennent font avancer l'Afrique.
          </h1>
          <p className="text-lg text-[#063F3A]/70 leading-relaxed">
            Découvrez les entrepreneures du réseau FAFE et explorez les talents, entreprises et expertises qui façonnent l'économie africaine.
          </p>
        </div>

        {/* Main Search */}
        <div className="max-w-4xl mx-auto mb-8 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-[#063F3A]/40" />
          <input 
            type="text"
            placeholder="Rechercher une entrepreneure, une entreprise ou une expertise..." 
            className="w-full pl-16 pr-6 h-16 bg-white border border-[#063F3A]/10 focus:border-[#00843D] focus:ring-2 focus:ring-[#E67E22]/20 rounded-2xl text-lg text-[#063F3A] shadow-sm transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters Toggle (Mobile) */}
        <div className="md:hidden flex justify-end mb-4">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="border-[#063F3A]/10 text-[#063F3A]"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filtres
          </Button>
        </div>

        {/* Advanced Filters */}
        <div className={`bg-white p-6 rounded-2xl shadow-sm border border-[#063F3A]/10 mb-12 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="grid md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-[#063F3A]/60 uppercase tracking-wider mb-2">Pays</label>
              <select 
                className="flex h-12 w-full rounded-xl border border-[#063F3A]/10 bg-[#FAF9F6] px-4 py-2 text-sm text-[#063F3A] focus:outline-none focus:border-[#00843D] transition-colors appearance-none"
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236B3E1E\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em' }}
              >
                <option value="">Tous les pays</option>
                {AFRICAN_COUNTRIES.map(c => (
                  <option key={c.id} value={c.name}>{c.flag} {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#063F3A]/60 uppercase tracking-wider mb-2">Ville</label>
              <select 
                className="flex h-12 w-full rounded-xl border border-[#063F3A]/10 bg-[#FAF9F6] px-4 py-2 text-sm text-[#063F3A] focus:outline-none focus:border-[#00843D] transition-colors appearance-none"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236B3E1E\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em' }}
              >
                <option value="">Toutes les villes</option>
                {cities.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#063F3A]/60 uppercase tracking-wider mb-2">Secteur</label>
              <select 
                className="flex h-12 w-full rounded-xl border border-[#063F3A]/10 bg-[#FAF9F6] px-4 py-2 text-sm text-[#063F3A] focus:outline-none focus:border-[#00843D] transition-colors appearance-none"
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236B3E1E\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em' }}
              >
                <option value="">Tous les secteurs</option>
                {SECTORS.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              {(searchTerm || countryFilter || sectorFilter || cityFilter) && (
                <Button 
                  variant="ghost" 
                  onClick={resetFilters}
                  className="h-12 w-full text-stone-500 hover:text-stone-800 hover:bg-stone-100"
                >
                  Réinitialiser les filtres
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-lg font-bold text-[#063F3A]">
              {filteredEntrepreneurs.length} {filteredEntrepreneurs.length === 1 ? 'résultat' : 'résultats'}
            </h3>
          </div>
        )}

        {/* Results Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-[#00843D]/20 border-t-[#E67E22] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#063F3A]/60 font-medium">Chargement de l'annuaire...</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEntrepreneurs.map((entrepreneure, idx) => (
              <EntrepreneurDirectoryCard
                key={entrepreneure.id}
                entrepreneur={entrepreneure}
                priority={idx < 4}
              />
            ))}
          </div>
        )}

        {!loading && filteredEntrepreneurs.length === 0 && (
          <div className="text-center py-24 bg-white rounded-2xl border border-[#063F3A]/5 shadow-sm mt-8">
            <h3 className="text-2xl font-heading font-bold text-[#063F3A] mb-3">Aucun résultat ne correspond à vos critères de recherche.</h3>
            <p className="text-[#063F3A]/60 mb-6 max-w-lg mx-auto">Essayez de modifier vos filtres ou d'utiliser des termes de recherche plus génériques.</p>
            <Button 
              onClick={resetFilters}
              className="bg-[#C8102E] hover:bg-[#A30D25] text-white rounded-full px-8 py-6 font-bold"
            >
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
