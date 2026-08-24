const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

if (!content.includes('function DynamicEvents')) {
  const eventsComponent = `
function DynamicEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const q = query(
          collection(db, "events"),
          where("status", "in", ["PUBLISHED", "REGISTRATION_OPEN", "ONGOING"]),
          orderBy("startDate", "asc"),
          limit(3)
        );
        const snap = await getDocs(q);
        setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading)
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 border-4 border-[#E67E22] border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );

  if (events.length === 0)
    return (
      <div className="text-center text-stone-500 py-12">
        <p>Aucun événement programmé pour le moment.</p>
      </div>
    );

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {events.map((event) => (
        <Card key={event.id} className="overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer h-full flex flex-col">
          <div className="relative h-48 overflow-hidden shrink-0">
            <img 
              src={event.coverImage || "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} 
              alt={event.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            />
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-2 rounded-lg text-center shadow-md">
              <div className="text-[#E67E22] font-bold text-xl leading-none">
                {new Date(event.startDate).getDate()}
              </div>
              <div className="text-[#6B3E1E] text-xs font-bold uppercase mt-1">
                {new Date(event.startDate).toLocaleString('fr-FR', { month: 'short' })}
              </div>
            </div>
            {event.online && (
              <div className="absolute top-4 right-4 bg-[#E67E22] text-white px-2 py-1 rounded text-xs font-bold">
                En ligne
              </div>
            )}
          </div>
          <CardContent className="p-6 flex flex-col flex-grow">
            <h3 className="font-bold font-heading text-xl text-[#6B3E1E] mb-2 group-hover:text-[#E67E22] transition-colors line-clamp-2">
              {event.title}
            </h3>
            <div className="flex items-center gap-2 text-stone-500 text-sm mb-4">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{event.online ? "Événement virtuel" : \`\${event.city}, \${event.country}\`}</span>
            </div>
            <p className="text-stone-600 text-sm line-clamp-3 mb-6 flex-grow">
              {event.shortDescription || event.description}
            </p>
            <Link to={\`/evenements/\${event.slug}\`} className="mt-auto block">
              <Button variant="outline" className="w-full border-[#6B3E1E]/20 text-[#6B3E1E] hover:bg-[#6B3E1E] hover:text-white transition-all rounded-full">
                Voir l'événement
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
`;
  
  const eventsSection = `
      {/* EVENTS SECTION */}
      <section className="py-24 bg-[#FAF9F6] border-t border-[#6B3E1E]/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-sm font-bold tracking-widest text-[#E67E22] uppercase mb-3">Agenda</h2>
              <h3 className="text-3xl md:text-4xl font-bold font-heading text-[#6B3E1E]">Nos prochains événements</h3>
            </div>
            <Link to="/evenements">
              <Button variant="outline" className="group border-[#6B3E1E]/20 text-[#6B3E1E] hover:bg-[#6B3E1E]/5 rounded-full px-6">
                Voir l'agenda
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          <DynamicEvents />
        </div>
      </section>
`;

  // Inject the component before export function Home()
  content = content.replace(/export function Home\(\)/, eventsComponent + '\nexport function Home()');
  // Inject the section before NEWS SECTION
  content = content.replace(/{\/\* 7. NEWS SECTION \*\//, eventsSection + '\n      {/* 7. NEWS SECTION */');

  fs.writeFileSync('src/pages/Home.tsx', content);
  console.log("Added Events section to Home.tsx");
}
