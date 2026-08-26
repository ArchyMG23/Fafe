import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { CMSHeroSlide, CMSBankDetails } from '../types';

export const getCMSGlobal = async () => {
  try {
    const docRef = doc(db, 'cms', 'global');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching CMS global:", error);
    return null;
  }
};

export const updateCMSGlobal = async (data: any) => {
  try {
    const docRef = doc(db, 'cms', 'global');
    await setDoc(docRef, data, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updating CMS global:", error);
    throw error;
  }
};

// Default fallback data for mock/demonstration purposes
export const defaultHeroSlides: CMSHeroSlide[] = [
  {
    id: 'slide-1',
    image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    title: { fr: "L'excellence au féminin pour le développement de l'Afrique", en: "Female Excellence for Africa's Development" },
    shortText: { fr: "Le Fonds d'Appui aux Femmes Entrepreneures accompagne, finance et valorise les projets portés par des femmes à travers le continent.", en: "The Fund to Support Women Entrepreneurs supports, finances, and promotes projects led by women across the continent." },
    buttonText: { fr: "Rejoindre le réseau", en: "Join the network" },
    link: "/rejoindre",
    order: 1,
    status: 'ACTIVE'
  },
  {
    id: 'slide-2',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    title: { fr: "Soutenir l'innovation et l'entrepreneuriat féminin", en: "Supporting Innovation and Female Entrepreneurship" },
    shortText: { fr: "Découvrez notre programme de financement et de mentorat pour accélérer la croissance de votre entreprise.", en: "Discover our funding and mentoring program to accelerate your business growth." },
    buttonText: { fr: "Découvrir nos projets", en: "Discover our projects" },
    link: "/projets",
    order: 2,
    status: 'ACTIVE'
  }
];

export const defaultBankDetails: CMSBankDetails = {
  bankName: '[À CONFIGURER]',
  accountNumber: '[À CONFIGURER]',
  iban: '[À CONFIGURER]',
  swift: '[À CONFIGURER]'
};


export const defaultAboutData = {
  pcaHero: {
    heroLabelFR: "À PROPOS DU FAFE",
    heroTitleFR: "Une vision portée par le leadership féminin africain",
    heroDescriptionFR: "Construire un avenir où chaque femme africaine peut entreprendre, grandir et contribuer à la prospérité du continent.",
    pcaName: "Nom de la PCA",
    pcaTitleFR: "Présidente du Conseil d'Administration",
    pcaPhoto: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=800",
  },
  presentation: {
    titleFR: "QUI SOMMES-NOUS ?",
    descriptionFR: "Le Forum Africain des Femmes Entrepreneures (FAFE) est une organisation panafricaine dédiée à l'émancipation économique des femmes. Nous croyons fermement que l'entrepreneuriat féminin est le moteur d'une croissance inclusive et durable en Afrique.\n\nNotre réseau rassemble des femmes dynamiques et innovantes de tous les secteurs, créant ainsi une synergie puissante pour relever les défis de demain."
  },
  historique: {
    titleFR: "NOTRE HISTOIRE",
    events: [
      { year: "2010", titleFR: "Création du FAFE", descriptionFR: "Lancement officiel de l'organisation avec 50 membres fondatrices." },
      { year: "2015", titleFR: "Expansion panafricaine", descriptionFR: "Ouverture des premières antennes régionales dans 5 pays." },
      { year: "2020", titleFR: "Lancement du Fonds d'Appui", descriptionFR: "Création du premier fonds dédié au financement des projets féminins." },
      { year: "Aujourd'hui", titleFR: "Un réseau de 5000+ femmes", descriptionFR: "Le FAFE s'impose comme un acteur majeur de l'économie africaine." }
    ]
  },
  vision: {
    titleFR: "NOTRE VISION",
    descriptionFR: "Faire de l'Afrique le continent où l'entrepreneuriat féminin prospère librement, en brisant les barrières financières et structurelles pour révéler le plein potentiel des femmes d'affaires africaines."
  },
  mission: {
    titleFR: "NOTRE MISSION",
    descriptionFR: "Accompagner, former et financer les femmes entrepreneures. Nous connectons les talents, facilitons l'accès aux marchés et œuvrons pour un environnement économique plus équitable."
  },
  valeurs: [
    { titleFR: "EXCELLENCE", icon: "Star" },
    { titleFR: "INNOVATION", icon: "Lightbulb" },
    { titleFR: "SOLIDARITÉ", icon: "Users" },
    { titleFR: "LEADERSHIP", icon: "TrendingUp" },
    { titleFR: "PROSPÉRITÉ", icon: "Target" }
  ],
  gouvernance: {
    titleFR: "GOUVERNANCE",
    descriptionFR: "Contenu en cours de rédaction"
  },
  bureauExecutif: {
    titleFR: "BUREAU EXÉCUTIF",
    members: [
      { name: "Membre 1", roleFR: "Secrétaire Générale", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400" },
      { name: "Membre 2", roleFR: "Trésorière", photo: "https://images.unsplash.com/photo-1531123414780-f74244c28319?auto=format&fit=crop&q=80&w=400" },
      { name: "Membre 3", roleFR: "Vice-Présidente", photo: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&q=80&w=400" }
    ]
  },
  equipe: {
    titleFR: "NOTRE ÉQUIPE",
    members: [
      { name: "Employée 1", roleFR: "Responsable Projets", photo: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=400" },
      { name: "Employée 2", roleFR: "Chargée de Communication", photo: "https://images.unsplash.com/photo-1573497491208-6b1acb260507?auto=format&fit=crop&q=80&w=400" }
    ]
  },
  partenaires: {
    titleFR: "PARTENAIRES",
    list: []
  },
  rapports: {
    titleFR: "NOS RAPPORTS D'ACTIVITÉS",
    list: [
      { titleFR: "Rapport d'activités 2025", link: "#" },
      { titleFR: "Rapport d'activités 2024", link: "#" }
    ]
  }
};
