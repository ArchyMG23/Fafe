const fs = require('fs');
let content = fs.readFileSync('src/pages/public/Actions.tsx', 'utf8');

// 1. Add Search to lucide-react imports if not there
content = content.replace(
  /MapPin,\n  CheckCircle2\n\} from 'lucide-react';/,
  "MapPin,\n  CheckCircle2,\n  Search\n} from 'lucide-react';"
);

// 2. Add searchQuery state
content = content.replace(
  /const \[activeFilter, setActiveFilter\] = useState<string>\('all'\);/,
  "const [activeFilter, setActiveFilter] = useState<string>('all');\n  const [searchQuery, setSearchQuery] = useState('');"
);

// 3. Update filteredActions logic
const oldFilterLogic = `const filteredActions = activeFilter === 'all' 
    ? allActions 
    : allActions.filter(a => a.categoryId === activeFilter);`;

const newFilterLogic = `const filteredActions = allActions.filter(a => {
    const matchesFilter = activeFilter === 'all' || a.categoryId === activeFilter;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      (a.titleFR && a.titleFR.toLowerCase().includes(searchLower)) ||
      (a.titleEN && a.titleEN.toLowerCase().includes(searchLower)) ||
      (a.shortDescriptionFR && a.shortDescriptionFR.toLowerCase().includes(searchLower)) ||
      (a.country && a.country.toLowerCase().includes(searchLower));
    return matchesFilter && matchesSearch;
  });`;

content = content.replace(oldFilterLogic, newFilterLogic);

// 4. Add the search UI before the filters
const searchUI = `
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-end flex-grow">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input 
                  type="text" 
                  placeholder={language === 'fr' ? 'Rechercher une action...' : 'Search an action...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-64 pl-9 pr-4 py-2 rounded-full border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#E67E22]/20 focus:border-[#E67E22] transition-all"
                />
              </div>
`;

content = content.replace(
  /\{\/\* Filters \*\/\}\n\s*<div className="flex flex-wrap gap-2 justify-center md:justify-end">/,
  searchUI + '              <div className="flex flex-wrap gap-2">'
);

fs.writeFileSync('src/pages/public/Actions.tsx', content);
