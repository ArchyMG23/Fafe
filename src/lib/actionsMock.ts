import { ActionCategory, FAFEAction, ActionTestimonial, ActionStatistic } from '../types';

export const DEMO_ACTION_CATEGORIES: ActionCategory[] = [
  {
    id: 'cat-1',
    slug: 'formation',
    titleFR: 'Formation & Renforcement',
    titleEN: 'Training & Capacity Building',
    descriptionFR: 'Développement des compétences entrepreneuriales et professionnelles.',
    descriptionEN: 'Development of entrepreneurial and professional skills.',
    image: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&q=80',
    icon: 'BookOpen',
    colorAccent: '#E67E22',
    order: 1,
    isActive: true
  },
  {
    id: 'cat-2',
    slug: 'entrepreneuriat',
    titleFR: 'Entrepreneuriat',
    titleEN: 'Entrepreneurship',
    descriptionFR: 'Accompagnement des femmes dans le développement de leurs entreprises.',
    descriptionEN: 'Supporting women in the development of their businesses.',
    image: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&q=80',
    icon: 'Briefcase',
    colorAccent: '#D4AF37',
    order: 2,
    isActive: true
  },
  {
    id: 'cat-3',
    slug: 'financement',
    titleFR: 'Financement',
    titleEN: 'Financing',
    descriptionFR: 'Mobilisation de ressources et opportunités de financement.',
    descriptionEN: 'Resource mobilization and funding opportunities.',
    image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80',
    icon: 'PiggyBank',
    colorAccent: '#27AE60',
    order: 3,
    isActive: true
  },
  {
    id: 'cat-4',
    slug: 'reseautage',
    titleFR: 'Réseautage',
    titleEN: 'Networking',
    descriptionFR: 'Création de connexions et de partenariats.',
    descriptionEN: 'Creation of connections and partnerships.',
    image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80',
    icon: 'Users',
    colorAccent: '#8E44AD',
    order: 4,
    isActive: true
  },
  {
    id: 'cat-5',
    slug: 'commerce',
    titleFR: 'Commerce & Marché',
    titleEN: 'Trade & Market',
    descriptionFR: 'Promotion et commercialisation des produits et services.',
    descriptionEN: 'Promotion and commercialization of products and services.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80',
    icon: 'ShoppingCart',
    colorAccent: '#2980B9',
    order: 5,
    isActive: true
  }
];

export const DEMO_ACTIONS: FAFEAction[] = [
  {
    id: 'act-1',
    slug: 'programme-leadership-feminin-2024',
    categoryId: 'cat-1',
    titleFR: 'Programme Leadership Féminin 2024',
    titleEN: 'Women Leadership Program 2024',
    shortDescriptionFR: 'Une formation intensive de 6 mois pour les dirigeantes africaines.',
    shortDescriptionEN: 'A 6-month intensive training for African female leaders.',
    image: 'https://images.unsplash.com/photo-1573164574572-cb89e39749b4?auto=format&fit=crop&q=80',
    country: 'Sénégal',
    city: 'Dakar',
    status: 'ONGOING',
    isFeatured: true,
    ctaTextFR: 'Découvrir le programme',
    ctaTextEN: 'Discover the program',
    ctaLink: '/nos-actions/programme-leadership-feminin-2024'
  },
  {
    id: 'act-2',
    slug: 'fonds-amorcage-fafe',
    categoryId: 'cat-3',
    titleFR: "Fonds d'Amorçage FAFE",
    titleEN: 'FAFE Seed Fund',
    shortDescriptionFR: 'Soutien financier pour les startups innovantes dirigées par des femmes.',
    shortDescriptionEN: 'Financial support for innovative startups led by women.',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32b7?auto=format&fit=crop&q=80',
    country: 'Panafricain',
    status: 'ONGOING',
    isFeatured: true,
    ctaTextFR: 'Soumettre un dossier',
    ctaTextEN: 'Submit an application',
    ctaLink: '/nos-actions/fonds-amorcage-fafe'
  },
  {
    id: 'act-3',
    slug: 'forum-economique-femmes-abidjan',
    categoryId: 'cat-4',
    titleFR: 'Forum Économique des Femmes',
    titleEN: 'Women Economic Forum',
    shortDescriptionFR: 'Le plus grand rassemblement de femmes entrepreneures en Afrique de l\'Ouest.',
    shortDescriptionEN: 'The largest gathering of women entrepreneurs in West Africa.',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80',
    country: 'Côte d\'Ivoire',
    city: 'Abidjan',
    status: 'UPCOMING',
    isFeatured: false,
    ctaTextFR: 'S\'inscrire',
    ctaTextEN: 'Register',
    ctaLink: '/nos-actions/forum-economique-femmes-abidjan'
  }
];

export const DEMO_ACTION_STATS: ActionStatistic[] = [
  { id: 'stat-1', value: '1500', labelFR: 'FEMMES ACCOMPAGNÉES', labelEN: 'WOMEN SUPPORTED', prefix: '+', order: 1, isVisible: true },
  { id: 'stat-2', value: '12', labelFR: 'PAYS', labelEN: 'COUNTRIES', prefix: '+', order: 2, isVisible: true },
  { id: 'stat-3', value: '80', labelFR: 'PROGRAMMES', labelEN: 'PROGRAMS', prefix: '+', order: 3, isVisible: true },
  { id: 'stat-4', value: '250', labelFR: 'ENTREPRISES CRÉÉES', labelEN: 'BUSINESSES CREATED', prefix: '+', order: 4, isVisible: true }
];

export const DEMO_ACTION_TESTIMONIALS: ActionTestimonial[] = [
  {
    id: 'test-1',
    photo: 'https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?auto=format&fit=crop&q=80',
    firstName: 'Fatou',
    lastName: 'Diop',
    company: 'AgriTech Solutions',
    country: 'Sénégal',
    testimonialFR: 'Grâce au programme d\'accompagnement du FAFE, j\'ai pu structurer mon entreprise et lever les fonds nécessaires pour étendre notre production à l\'échelle nationale.',
    testimonialEN: 'Thanks to the FAFE support program, I was able to structure my company and raise the necessary funds to expand our production nationally.',
    isVisible: true
  },
  {
    id: 'test-2',
    photo: 'https://images.unsplash.com/photo-1589156191108-c762ff4b96ab?auto=format&fit=crop&q=80',
    firstName: 'Amaka',
    lastName: 'Okafor',
    company: 'EcoStyle Fashion',
    country: 'Nigeria',
    testimonialFR: 'Le réseau que j\'ai construit lors du dernier Forum m\'a permis de trouver des partenaires clés dans trois nouveaux pays.',
    testimonialEN: 'The network I built during the last Forum allowed me to find key partners in three new countries.',
    isVisible: true
  }
];
