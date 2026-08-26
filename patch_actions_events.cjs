const fs = require('fs');
let content = fs.readFileSync('src/pages/public/Actions.tsx', 'utf8');

// 1. Add imports
content = content.replace(
  /fetchProjects\n\} from '\.\.\/\.\.\/lib\/dataFetching';/,
  "fetchProjects,\n  fetchEvents\n} from '../../lib/dataFetching';"
);

content = content.replace(
  /Project\n\} from '\.\.\/\.\.\/types';/,
  "Project,\n  FAFEEvent\n} from '../../types';"
);

// 2. Add state
content = content.replace(
  /const \[projects, setProjects\] = useState<Project\[\]>\(\[\]\);/,
  "const [projects, setProjects] = useState<Project[]>([]);\n  const [events, setEvents] = useState<FAFEEvent[]>([]);"
);

// 3. Update loadData
content = content.replace(
  /fetchProjects\(3\)/,
  "fetchProjects(3),\n          fetchEvents(3)"
);

content = content.replace(
  /const \[cats, featured, all, st, tests, projs\] = await Promise\.all\(\[/,
  "const [cats, featured, all, st, tests, projs, evts] = await Promise.all(["
);

content = content.replace(
  /setProjects\(projs\);/,
  "setProjects(projs);\n        setEvents(evts);"
);

// 4. Add the section before "COMMENT PARTICIPER (CTA)"
const eventsSection = `
      {/* 8.5 ÉVÉNEMENTS ET ACTIVITÉS */}
      {events.length > 0 && (
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex justify-between items-end mb-12">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <h2 className="text-sm font-bold text-[#E67E22] tracking-widest uppercase mb-2">
                  {language === 'fr' ? 'Agenda' : 'Agenda'}
                </h2>
                <h3 className="text-3xl md:text-4xl font-bold font-heading text-[#6B3E1E]">
                  {language === 'fr' ? 'Prochains rendez-vous' : 'Upcoming events'}
                </h3>
              </motion.div>
              <Link to="/evenements" className="hidden md:flex items-center text-[#E67E22] font-bold hover:text-[#c96a1a] transition-colors">
                {language === 'fr' ? 'Tous les événements' : 'All events'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {events.map((evt, idx) => (
                <motion.div 
                  key={evt.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  className="bg-[#FAF9F6] p-6 rounded-2xl shadow-sm border border-stone-100 group hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="bg-white text-center p-3 rounded-xl border border-stone-100 shadow-sm min-w-[70px]">
                      <div className="text-sm font-bold text-[#E67E22] uppercase">
                        {new Date(evt.startDate).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { month: 'short' })}
                      </div>
                      <div className="text-2xl font-bold font-heading text-[#6B3E1E] leading-none">
                        {new Date(evt.startDate).getDate()}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold font-heading text-[#6B3E1E] group-hover:text-[#E67E22] transition-colors line-clamp-2">
                        {evt.title}
                      </h4>
                      <p className="text-xs text-stone-500 mt-1 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {evt.location || (evt.isOnline ? 'En ligne' : 'TBD')}
                      </p>
                    </div>
                  </div>
                  <Link to={\`/evenements/\${evt.slug}\`} className="text-sm font-bold text-[#E67E22] hover:text-[#c96a1a] flex items-center mt-4">
                    {language === 'fr' ? 'S\\'inscrire' : 'Register'}
                    <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
`;

content = content.replace(
  /\{\/\* 9\. COMMENT PARTICIPER \(CTA\) \*\/\}/,
  eventsSection + '\n      {/* 9. COMMENT PARTICIPER (CTA) */}'
);

fs.writeFileSync('src/pages/public/Actions.tsx', content);
