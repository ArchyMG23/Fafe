const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const target = `  const [entrepreneurs, setEntrepreneurs] = useState<Entrepreneur[]>(
    DEMO_ENTREPRENEURS.slice(0, 4),
  );
  const [projects, setProjects] = useState<Project[]>(
    DEMO_PROJECTS.slice(0, 2),
  );`;

const replacement = `  const [entrepreneurs, setEntrepreneurs] = useState<Entrepreneur[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        // Fetch 4 active entrepreneurs
        const entRef = collection(db, 'users');
        const entQ = query(entRef, where('role', '==', 'MEMBER'), where('status', '==', 'ACTIVE'), limit(4));
        const entSnap = await getDocs(entQ);
        const fetchedEnt = entSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Entrepreneur));
        setEntrepreneurs(fetchedEnt);

        // Fetch 2 active projects
        const projRef = collection(db, 'projects');
        const projQ = query(projRef, where('status', '==', 'PUBLISHED'), limit(2));
        const projSnap = await getDocs(projQ);
        const fetchedProj = projSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
        setProjects(fetchedProj);
      } catch (err) {
        console.error("Error fetching home data", err);
      }
    };
    fetchHomeData();
  }, []);`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/pages/Home.tsx', content);
  console.log("Updated Home.tsx data fetching");
} else {
  console.log("Could not find target in Home.tsx");
}
