import { doc, getDoc, setDoc, getDocs, collection, query, orderBy, limit, addDoc, deleteDoc, where } from 'firebase/firestore';
import { db } from './firebase';
import { CMSHeroSlide, CMSBankDetails, CMSPageId, CMSAuditLog, CMSPageRecord, Media } from '../types';

// =========================================================
// 1. DEFAULT SCHEMAS FOR ALL 6 CMS PAGES
// =========================================================

export const defaultAccueilCMS = {
  hero: {
    badge: { fr: "RÉSEAU PANAFRICAIN", en: "PAN-AFRICAN NETWORK" },
    title: { fr: "L'excellence au féminin pour le développement de l'Afrique", en: "Female Excellence for Africa's Development" },
    shortText: { fr: "Le Fonds d'Appui aux Femmes Entrepreneures accompagne, finance et valorise les projets portés par des femmes à travers le continent.", en: "The Fund to Support Women Entrepreneurs supports, finances, and empowers women-led initiatives across the African continent." },
    buttonText: { fr: "Rejoindre le réseau", en: "Join the network" },
    buttonLink: "/rejoindre",
    secondaryButtonText: { fr: "Faire un don", en: "Make a donation" },
    secondaryButtonLink: "/dons",
    heroImage: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=80"
  },
  stats: [
    { value: "5 000+", label: { fr: "Femmes accompagnées", en: "Women empowered" }, icon: "Users" },
    { value: "15+", label: { fr: "Pays africains représentés", en: "African countries represented" }, icon: "Globe" },
    { value: "200+", label: { fr: "Projets et entreprises financés", en: "Projects and businesses financed" }, icon: "TrendingUp" },
    { value: "85%", label: { fr: "Taux de pérennité des projets", en: "Project sustainability rate" }, icon: "Target" }
  ],
  missions: {
    badge: { fr: "NOTRE VOCATION", en: "OUR VOCATION" },
    title: { fr: "Trois piliers pour la réussite de vos projets", en: "Three pillars for your project success" },
    subtitle: { fr: "Un dispositif intégré pour accompagner chaque étape de votre croissance entrepreneuriale.", en: "An integrated framework to support every stage of your entrepreneurial growth." },
    pillars: [
      {
        title: { fr: "Financement sur mesure", en: "Tailored Financing" },
        description: { fr: "Accès facilité à des micro-crédits, fonds d'amorçage et garanties bancaires adaptés.", en: "Facilitated access to micro-credits, seed funding and adapted bank guarantees." },
        icon: "Banknote"
      },
      {
        title: { fr: "Formation & Mentorat", en: "Training & Mentorship" },
        description: { fr: "Programmes d'accélération, masterclasses et mentorat par des pairs expérimentés.", en: "Acceleration programs, masterclasses, and mentorship by seasoned leaders." },
        icon: "GraduationCap"
      },
      {
        title: { fr: "Réseau Panafricain", en: "Pan-African Network" },
        description: { fr: "Mise en relation d'affaires, opportunités B2B et présence dans les forums économiques.", en: "Business matchmaking, B2B opportunities, and presence in high-level economic forums." },
        icon: "Network"
      }
    ]
  },
  directory: {
    badge: { fr: "ANNUAIRE OFFICIEL", en: "OFFICIAL DIRECTORY" },
    title: { fr: "Découvrez les talents du réseau FAFE", en: "Discover the talents of the FAFE network" },
    subtitle: { fr: "Des femmes entrepreneures d'exception qui transforment l'économie de leurs pays.", en: "Exceptional women entrepreneurs transforming their countries' economies." },
    buttonText: { fr: "Consulter l'annuaire complet", en: "View full directory" },
    buttonLink: "/entrepreneures"
  },
  network: {
    badge: { fr: "PRÉSENCE CONTINENTALE", en: "CONTINENTAL PRESENCE" },
    title: { fr: "Un réseau panafricain uni et engagé", en: "A united and committed pan-African network" },
    description: { fr: "Le FAFE fédère des délégations nationales actives pour bâtir des ponts entre entrepreneures du continent et de la diaspora.", en: "FAFE unites active national delegations to build bridges between continental and diaspora entrepreneurs." },
    linkText: { fr: "Découvrir nos délégations régionales →", en: "Discover our regional delegations →" }
  },
  projects: {
    badge: { fr: "IMPACT & DÉVELOPPEMENT", en: "IMPACT & DEVELOPMENT" },
    title: { fr: "Transformer l'entrepreneuriat en impact social durable", en: "Transforming entrepreneurship into lasting social impact" },
    buttonText: { fr: "Découvrir tous les projets", en: "Discover all projects" },
    buttonLink: "/projets-sociaux"
  },
  events: {
    badge: { fr: "AGENDA INSTITUTIONNEL", en: "INSTITUTIONAL AGENDA" },
    title: { fr: "Nos prochains rendez-vous et sommets", en: "Our upcoming summits and forums" },
    buttonText: { fr: "Voir tout l'agenda", en: "View full agenda" },
    buttonLink: "/actualites"
  },
  news: {
    badge: { fr: "ÉDITORIAL", en: "EDITORIAL" },
    title: { fr: "Actualités, tribunes & inspirations", en: "News, viewpoints & inspiration" },
    buttonText: { fr: "Toutes les actualités", en: "All news" },
    buttonLink: "/actualites"
  },
  donationCta: {
    badge: { fr: "SOUTENEZ NOTRE ACTION", en: "SUPPORT OUR ACTION" },
    title: { fr: "Votre soutien peut ouvrir de nouvelles opportunités", en: "Your support can unlock life-changing opportunities" },
    description: { fr: "Chaque contribution participe directement au renforcement de capacités et au financement de projets féminins à fort impact social et économique.", en: "Every contribution directly supports capacity building and financing of high-impact women-led projects." },
    buttonText: { fr: "Faire un don maintenant", en: "Make a donation now" },
    buttonLink: "/dons"
  },
  partners: {
    title: { fr: "Nos partenaires institutionnels et stratégiques", en: "Our institutional and strategic partners" },
    list: [
      { name: "ONU Femmes", logo: "" },
      { name: "Banque Africaine de Développement", logo: "" },
      { name: "Union Africaine", logo: "" },
      { name: "Agence Française de Développement", logo: "" },
      { name: "Organisation Internationale de la Francophonie", logo: "" }
    ]
  },
  seo: {
    metaTitle: { fr: "FAFE - Forum Africain des Femmes Entrepreneures | Réseau Panafricain", en: "FAFE - African Women Entrepreneurs Forum | Pan-African Network" },
    metaDescription: { fr: "Plateforme panafricaine dédiée à l'accompagnement, au financement et à la valorisation des femmes entrepreneures en Afrique.", en: "Pan-African platform dedicated to supporting, financing, and empowering women entrepreneurs across Africa." },
    ogImage: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=80"
  }
};

export const defaultNousCMS = {
  pcaHero: {
    heroLabel: { fr: "À PROPOS DU FAFE", en: "ABOUT FAFE" },
    heroTitle: { fr: "NOUS", en: "ABOUT US" },
    heroDescription: { fr: "Construire un avenir où chaque femme africaine peut entreprendre, grandir et contribuer à la prospérité du continent.", en: "Building a future where every African woman can undertake, thrive, and contribute to the continent's prosperity." },
    pcaName: "Présidence du Conseil d'Administration",
    pcaTitle: { fr: "Présidente du Conseil d'Administration", en: "President of the Board of Directors" },
    pcaPhoto: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=800"
  },
  presentation: {
    title: { fr: "QUI SOMMES-NOUS ?", en: "WHO ARE WE?" },
    description: {
      fr: "Le Forum Africain des Femmes Entrepreneures (FAFE) est une organisation panafricaine dédiée à l'émancipation économique des femmes. Nous croyons fermement que l'entrepreneuriat féminin est le moteur d'une croissance inclusive et durable en Afrique.\n\nNotre réseau rassemble des femmes dynamiques et innovantes de tous les secteurs, créant ainsi une synergie puissante pour relever les défis de demain.",
      en: "The African Women Entrepreneurs Forum (FAFE) is a pan-African organization dedicated to women's economic empowerment. We firmly believe that female entrepreneurship is the catalyst for inclusive and sustainable growth across Africa.\n\nOur network brings together dynamic, innovative women across all sectors to create powerful synergies."
    }
  },
  historique: {
    title: { fr: "NOTRE HISTOIRE", en: "OUR HISTORY" },
    subtitle: { fr: "Les jalons de notre évolution", en: "The milestones of our journey" },
    events: [
      {
        year: "2010",
        title: { fr: "Création du FAFE", en: "FAFE Founding" },
        description: { fr: "Lancement officiel de l'organisation avec 50 membres fondatrices pionnières.", en: "Official launch of the organization with 50 pioneering founding members." }
      },
      {
        year: "2015",
        title: { fr: "Expansion panafricaine", en: "Pan-African Expansion" },
        description: { fr: "Ouverture des premières antennes régionales dans 5 pays d'Afrique centrale et de l'Ouest.", en: "Opening of the first regional chapters across 5 Central and West African countries." }
      },
      {
        year: "2020",
        title: { fr: "Lancement du Fonds d'Appui", en: "Support Fund Launch" },
        description: { fr: "Création du premier fonds dédié au financement et aux garanties de projets féminins.", en: "Creation of the first fund dedicated to financing and guarantees for women-led projects." }
      },
      {
        year: "Aujourd'hui",
        title: { fr: "Un réseau de 5 000+ femmes", en: "A Network of 5,000+ Women" },
        description: { fr: "Le FAFE s'impose comme un acteur institutionnel majeur du développement économique.", en: "FAFE establishes itself as a major institutional catalyst for economic development." }
      }
    ]
  },
  vision: {
    title: { fr: "NOTRE VISION", en: "OUR VISION" },
    description: {
      fr: "Faire de l'Afrique le continent où l'entrepreneuriat féminin prospère librement, en brisant les barrières financières et structurelles pour révéler le plein potentiel des femmes d'affaires africaines.",
      en: "To make Africa the continent where female entrepreneurship flourishes freely, breaking financial and structural barriers to unlock the full potential of African businesswomen."
    }
  },
  mission: {
    title: { fr: "NOTRE MISSION", en: "OUR MISSION" },
    description: {
      fr: "Accompagner, former et financer les femmes entrepreneures. Nous connectons les talents, facilitons l'accès aux marchés et œuvrons pour un environnement économique plus équitable.",
      en: "To support, train, and finance women entrepreneurs. We connect talents, facilitate market access, and advocate for an equitable economic landscape."
    }
  },
  valeurs: [
    { title: { fr: "EXCELLENCE", en: "EXCELLENCE" }, icon: "Star" },
    { title: { fr: "INNOVATION", en: "INNOVATION" }, icon: "Lightbulb" },
    { title: { fr: "SOLIDARITÉ", en: "SOLIDARITY" }, icon: "Users" },
    { title: { fr: "LEADERSHIP", en: "LEADERSHIP" }, icon: "TrendingUp" },
    { title: { fr: "PROSPÉRITÉ", en: "PROSPERITY" }, icon: "Target" }
  ],
  gouvernance: {
    title: { fr: "GOUVERNANCE", en: "GOVERNANCE" },
    description: {
      fr: "Le FAFE s'appuie sur une gouvernance démocratique, transparente et représentative de la diversité de ses délégations nationales. Les orientations stratégiques sont définies par le Conseil d'Administration et mises en œuvre par le Bureau Exécutif.",
      en: "FAFE relies on democratic, transparent governance that reflects the diversity of its national delegations. Strategic directions are determined by the Board of Directors and executed by the Executive Bureau."
    }
  },
  bureauExecutif: {
    title: { fr: "BUREAU EXÉCUTIF", en: "EXECUTIVE BOARD" },
    members: [
      { name: "Secrétariat Général", role: { fr: "Secrétaire Générale", en: "Secretary General" }, photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400" },
      { name: "Direction Financière", role: { fr: "Trésorière Générale", en: "Treasurer General" }, photo: "https://images.unsplash.com/photo-1531123414780-f74244c28319?auto=format&fit=crop&q=80&w=400" },
      { name: "Vice-Présidence", role: { fr: "Vice-Présidente aux Partenariats", en: "VP of Partnerships" }, photo: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&q=80&w=400" }
    ]
  },
  equipe: {
    title: { fr: "NOTRE ÉQUIPE OPÉRATIONNELLE", en: "OUR OPERATIONAL TEAM" },
    members: [
      { name: "Coordination Projets", role: { fr: "Responsable Programmes & Projets", en: "Programs & Projects Lead" }, photo: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=400" },
      { name: "Communication & Relations Publiques", role: { fr: "Chargée de Communication Digitale", en: "Digital Communications Officer" }, photo: "https://images.unsplash.com/photo-1573497491208-6b1acb260507?auto=format&fit=crop&q=80&w=400" }
    ]
  },
  partenaires: {
    title: { fr: "NOS PARTENAIRES", en: "OUR PARTNERS" },
    list: []
  },
  rapports: {
    title: { fr: "NOS RAPPORTS D'ACTIVITÉS", en: "ACTIVITY REPORTS" },
    list: [
      { title: { fr: "Rapport d'activités 2025 (PDF)", en: "Annual Activity Report 2025 (PDF)" }, link: "#" },
      { title: { fr: "Rapport d'impact économique 2024 (PDF)", en: "Economic Impact Report 2024 (PDF)" }, link: "#" }
    ]
  },
  contact: {
    title: { fr: "Contactez le Secrétariat du FAFE", en: "Contact FAFE Secretariat" },
    description: { fr: "Pour toute demande institutionnelle, de partenariat ou d'adhésion, notre équipe vous répond dans les meilleurs délais.", en: "For institutional inquiries, partnerships, or memberships, our team is available to assist you." },
    address: "Plateau, Boulevard de la République, Abidjan, Côte d'Ivoire",
    phone: "+225 27 20 00 00 00",
    email: "secretariat@fafe-afrique.org",
    socialLinks: {
      facebook: "https://facebook.com",
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
      instagram: "https://instagram.com"
    }
  },
  ctaJoin: {
    title: { fr: "Prête à rejoindre notre réseau ?", en: "Ready to join our network?" },
    description: { fr: "Devenez membre du FAFE et accédez à un réseau puissant de femmes entrepreneures à travers l'Afrique.", en: "Become a FAFE member and unlock access to an impactful network of businesswomen across Africa." },
    buttonText: { fr: "Rejoindre le FAFE", en: "Join FAFE" },
    buttonLink: "/rejoindre"
  },
  seo: {
    metaTitle: { fr: "NOUS - FAFE | Notre Vision, Mission et Gouvernance", en: "ABOUT US - FAFE | Vision, Mission & Governance" },
    metaDescription: { fr: "Découvrez l'histoire, la vision, l'équipe et les actions stratégiques du Forum Africain des Femmes Entrepreneures.", en: "Learn about the history, vision, team, and strategic initiatives of the African Women Entrepreneurs Forum." },
    ogImage: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=800"
  }
};

export const defaultActualitesCMS = {
  header: {
    badge: { fr: "ÉDITORIAL & ÉVÉNEMENTS", en: "EDITORIAL & EVENTS" },
    title: { fr: "Actualités & Événements", en: "News & Events" },
    description: { fr: "Découvrez les dernières initiatives, les articles inspirants, les tribunes et le calendrier complet des événements du FAFE à travers le continent.", en: "Discover the latest initiatives, articles, op-eds, and the full event calendar of FAFE across Africa." }
  },
  seo: {
    metaTitle: { fr: "Actualités et Événements - FAFE", en: "News and Events - FAFE" },
    metaDescription: { fr: "Toutes les actualités du FAFE, reportages, webinaires et sommets économiques féminins.", en: "All FAFE updates, field reports, webinars, and women's economic summits." },
    ogImage: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=80"
  }
};

export const defaultGalerieCMS = {
  header: {
    badge: { fr: "MÉDIATHÈQUE OFFICIELLE", en: "OFFICIAL MEDIA LIBRARY" },
    title: { fr: "Médiathèque FAFE", en: "FAFE Media Library" },
    description: { fr: "Revivez nos sommets, forums économiques, ateliers de formation et cérémonies en images, vidéos et podcasts exclusifs.", en: "Relive our summits, economic forums, training workshops, and ceremonies through photos, videos, and podcasts." }
  },
  seo: {
    metaTitle: { fr: "Médiathèque - FAFE | Photos, Vidéos et Conférences", en: "Media Library - FAFE | Photos, Videos & Conferences" },
    metaDescription: { fr: "Photos des événements, vidéos des panels de haut niveau et podcasts inspirants du réseau FAFE.", en: "Event photos, high-level panel videos, and inspiring podcasts from the FAFE network." },
    ogImage: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=80"
  }
};

export const defaultDonsCMS = {
  hero: {
    badge: { fr: "SOUTIEN & ENGAGEMENT", en: "SUPPORT & COMMITMENT" },
    title: { fr: "Soutenez l'entrepreneuriat féminin en Afrique", en: "Support Women's Entrepreneurship in Africa" },
    description: { fr: "Chaque don permet de former, d'accompagner et de financer concrètement des femmes entrepreneures dans la réalisation de projets à fort impact.", en: "Every donation helps directly train, mentor, and finance women entrepreneurs driving high-impact projects." }
  },
  instructions: {
    title: { fr: "Instructions de virement bancaire", en: "Bank Transfer Instructions" },
    note: { fr: "Veuillez préciser votre nom ou référence lors de la transaction afin de recevoir votre reçu fiscal et attestation de don.", en: "Please specify your name or reference in the transfer memo to receive your official donation receipt." }
  },
  bankDetails: {
    bankName: "Banque Panafricaine FAFE (Siège Régional)",
    accountNumber: "CI092 01001 02345678901 23",
    iban: "CI93 CI09 2010 0102 3456 7890 123",
    swift: "BPAFCIIA"
  },
  seo: {
    metaTitle: { fr: "Faire un don au FAFE - Investir dans le potentiel féminin africain", en: "Donate to FAFE - Invest in African Women's Potential" },
    metaDescription: { fr: "Soutenez les projets du FAFE par virement bancaire, carte ou Mobile Money.", en: "Support FAFE projects via bank transfer, card, or Mobile Money." },
    ogImage: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=80"
  }
};

export const defaultGlobalCMS = {
  navbar: {
    brandTitle: "FAFE",
    brandSubtitle: { fr: "Panafricaine", en: "Pan-African" },
    ctaText: { fr: "Don", en: "Donate" }
  },
  footer: {
    tagline: { fr: "Le premier réseau panafricain dédié à l'accompagnement, au financement et à la valorisation des femmes entrepreneures.", en: "The premier pan-African network dedicated to empowering, financing, and promoting women entrepreneurs." },
    copyright: { fr: `© ${new Date().getFullYear()} FAFE. Tous droits réservés.`, en: `© ${new Date().getFullYear()} FAFE. All rights reserved.` },
    address: "Plateau, Immeuble Alpha 2000, Abidjan, Côte d'Ivoire",
    email: "contact@fafe-afrique.org",
    phone: "+225 27 20 00 00 00",
    socialLinks: {
      facebook: "https://facebook.com",
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
      instagram: "https://instagram.com"
    }
  }
};

// Map of default page schemas
export const CMS_PAGE_DEFAULTS: Record<CMSPageId, any> = {
  accueil: defaultAccueilCMS,
  nous: defaultNousCMS,
  actualites: defaultActualitesCMS,
  galerie: defaultGalerieCMS,
  dons: defaultDonsCMS,
  global: defaultGlobalCMS
};

// Backward-compatible export for existing legacy references
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
  }
];

export const defaultBankDetails: CMSBankDetails = {
  bankName: defaultDonsCMS.bankDetails.bankName,
  accountNumber: defaultDonsCMS.bankDetails.accountNumber,
  iban: defaultDonsCMS.bankDetails.iban,
  swift: defaultDonsCMS.bankDetails.swift
};

export const defaultAboutData = defaultNousCMS;

// =========================================================
// 2. DATA ACCESS & SYNCHRONIZATION HELPERS
// =========================================================

/**
 * Deep merge utility for CMS state to guarantee no missing fields
 */
export function mergeWithDefaults<T>(defaults: T, current: any): T {
  if (!current || typeof current !== 'object') return defaults;
  const result: any = Array.isArray(defaults) ? [...(Array.isArray(current) ? current : defaults)] : { ...defaults };
  
  for (const key of Object.keys(defaults as any)) {
    if (current[key] === undefined || current[key] === null) {
      result[key] = (defaults as any)[key];
    } else if (typeof (defaults as any)[key] === 'object' && !Array.isArray((defaults as any)[key]) && (defaults as any)[key] !== null) {
      result[key] = mergeWithDefaults((defaults as any)[key], current[key]);
    } else {
      result[key] = current[key];
    }
  }
  return result;
}

/**
 * Fetch a complete CMS page record (Draft + Published versions)
 */
export async function getCMSPageRecord(pageId: CMSPageId): Promise<CMSPageRecord> {
  const fallback = CMS_PAGE_DEFAULTS[pageId] || {};
  try {
    const docRef = doc(db, 'cms_pages', pageId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        pageId,
        status: data.status || 'PUBLISHED',
        updatedAt: data.updatedAt || Date.now(),
        updatedBy: data.updatedBy || 'Système',
        publishedAt: data.publishedAt,
        publishedBy: data.publishedBy,
        draftContent: mergeWithDefaults(fallback, data.draftContent || data.publishedContent || fallback),
        publishedContent: mergeWithDefaults(fallback, data.publishedContent || fallback),
        version: data.version || 1
      };
    }
  } catch (err) {
    console.warn(`[CMS] Using fallback for page ${pageId}:`, err);
  }

  return {
    pageId,
    status: 'PUBLISHED',
    updatedAt: Date.now(),
    updatedBy: 'Système',
    publishedAt: Date.now(),
    publishedBy: 'Initialisation FAFE',
    draftContent: fallback,
    publishedContent: fallback,
    version: 1
  };
}

/**
 * Fetch published content directly for public client pages
 */
export async function getPublishedCMSContent<T>(pageId: CMSPageId, fallback: T): Promise<T> {
  try {
    const docRef = doc(db, 'cms_pages', pageId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const content = data.publishedContent || data.draftContent;
      if (content) {
        return mergeWithDefaults(fallback, content);
      }
    }
  } catch (err) {
    console.warn(`[CMS] Error fetching published content for ${pageId}, using defaults:`, err);
  }
  return fallback;
}

/**
 * Legacy getCMSGlobal compatibility
 */
export const getCMSGlobal = async () => {
  try {
    const [nousRecord, donsRecord] = await Promise.all([
      getCMSPageRecord('nous'),
      getCMSPageRecord('dons')
    ]);
    return {
      about: nousRecord.publishedContent,
      bankDetails: donsRecord.publishedContent.bankDetails,
      heroSlides: defaultHeroSlides
    };
  } catch {
    return {
      about: defaultNousCMS,
      bankDetails: defaultDonsCMS.bankDetails,
      heroSlides: defaultHeroSlides
    };
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

// =========================================================
// 3. ADMIN MUTATIONS & AUDIT LOGGING
// =========================================================

export async function logCMSAudit(log: Omit<CMSAuditLog, 'id' | 'timestamp'>): Promise<void> {
  try {
    const auditData: CMSAuditLog = {
      ...log,
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now()
    };
    await addDoc(collection(db, 'cms_history'), auditData);
  } catch (err) {
    console.error("[CMS Audit] Failed to write audit log:", err);
  }
}

export async function saveCMSDraft(
  pageId: CMSPageId,
  draftContent: any,
  user: { id: string; name: string; email: string }
): Promise<void> {
  const currentRecord = await getCMSPageRecord(pageId);
  const nextVersion = currentRecord.version + 1;
  const docRef = doc(db, 'cms_pages', pageId);

  const payload: Partial<CMSPageRecord> = {
    pageId,
    status: 'DRAFT',
    updatedAt: Date.now(),
    updatedBy: user.name || user.email,
    draftContent,
    publishedContent: currentRecord.publishedContent,
    version: nextVersion
  };

  await setDoc(docRef, payload, { merge: true });

  await logCMSAudit({
    adminId: user.id,
    adminEmail: user.email,
    adminName: user.name,
    page: pageId,
    action: 'SAVE_DRAFT',
    changesSummary: `Enregistrement du brouillon (${pageId})`,
    previousVersion: currentRecord.version,
    newVersion: nextVersion
  });
}

export async function publishCMSPage(
  pageId: CMSPageId,
  contentToPublish: any,
  user: { id: string; name: string; email: string }
): Promise<void> {
  const currentRecord = await getCMSPageRecord(pageId);
  const nextVersion = currentRecord.version + 1;
  const docRef = doc(db, 'cms_pages', pageId);

  const payload: CMSPageRecord = {
    pageId,
    status: 'PUBLISHED',
    updatedAt: Date.now(),
    updatedBy: user.name || user.email,
    publishedAt: Date.now(),
    publishedBy: user.name || user.email,
    draftContent: contentToPublish,
    publishedContent: contentToPublish,
    version: nextVersion
  };

  await setDoc(docRef, payload, { merge: true });

  // Sync with legacy cms/global if it is nous or dons
  if (pageId === 'nous') {
    await setDoc(doc(db, 'cms', 'global'), { about: contentToPublish }, { merge: true });
  } else if (pageId === 'dons' && contentToPublish.bankDetails) {
    await setDoc(doc(db, 'cms', 'global'), { bankDetails: contentToPublish.bankDetails }, { merge: true });
  }

  await logCMSAudit({
    adminId: user.id,
    adminEmail: user.email,
    adminName: user.name,
    page: pageId,
    action: 'PUBLISH',
    changesSummary: `Publication officielle des modifications de la page "${pageId}"`,
    previousVersion: currentRecord.version,
    newVersion: nextVersion
  });
}

export async function fetchCMSAuditLogs(pageId?: string, limitCount = 50): Promise<CMSAuditLog[]> {
  try {
    let q = query(collection(db, 'cms_history'), orderBy('timestamp', 'desc'), limit(limitCount));
    if (pageId) {
      q = query(collection(db, 'cms_history'), where('page', '==', pageId), orderBy('timestamp', 'desc'), limit(limitCount));
    }
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CMSAuditLog));
  } catch (err) {
    console.warn("[CMS Audit] Error fetching logs:", err);
    return [];
  }
}

// =========================================================
// 4. MEDIA LIBRARY STORE & HELPERS
// =========================================================

export const defaultStockMedia: Media[] = [
  {
    id: 'stock-1',
    url: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=80',
    type: 'IMAGE',
    title: 'Femmes Entrepreneures Réunion FAFE',
    description: 'Photo de couverture officielle Hero Accueil',
    createdAt: Date.now() - 86400000 * 30,
    authorId: 'system'
  },
  {
    id: 'stock-2',
    url: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=800',
    type: 'IMAGE',
    title: 'Portrait Officiel Présidente du Conseil',
    description: 'Photo officielle de la Présidence FAFE',
    createdAt: Date.now() - 86400000 * 20,
    authorId: 'system'
  },
  {
    id: 'stock-3',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600',
    type: 'IMAGE',
    title: 'Portrait Secrétariat Général',
    description: 'Membre du Bureau Exécutif',
    createdAt: Date.now() - 86400000 * 15,
    authorId: 'system'
  },
  {
    id: 'stock-4',
    url: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&q=80&w=600',
    type: 'IMAGE',
    title: 'Portrait Vice-Présidence Partenariats',
    description: 'Membre du Bureau Exécutif',
    createdAt: Date.now() - 86400000 * 10,
    authorId: 'system'
  },
  {
    id: 'stock-5',
    url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32d7?auto=format&fit=crop&w=1200&q=80',
    type: 'IMAGE',
    title: 'Atelier de Formation & Financement',
    description: 'Illustration projet social et formation',
    createdAt: Date.now() - 86400000 * 5,
    authorId: 'system'
  }
];

export async function fetchCMSMedia(): Promise<Media[]> {
  try {
    const snap = await getDocs(query(collection(db, 'media'), orderBy('createdAt', 'desc')));
    if (snap.empty) {
      return defaultStockMedia;
    }
    const dbMedia = snap.docs.map(d => ({ id: d.id, ...d.data() } as Media));
    // Merge stock media with uploaded media if not duplicated
    const existingUrls = new Set(dbMedia.map(m => m.url));
    const combined = [...dbMedia, ...defaultStockMedia.filter(s => !existingUrls.has(s.url))];
    return combined;
  } catch (err) {
    console.warn("[CMS Media] Error fetching media, returning stock:", err);
    return defaultStockMedia;
  }
}

export async function addCMSMedia(mediaItem: Omit<Media, 'id'>): Promise<Media> {
  const newId = `media_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const item: Media = {
    ...mediaItem,
    id: newId
  };
  await setDoc(doc(db, 'media', newId), item);
  return item;
}

export async function deleteCMSMedia(id: string): Promise<void> {
  if (id.startsWith('stock-')) return; // do not delete virtual stock media
  await deleteDoc(doc(db, 'media', id));
}
