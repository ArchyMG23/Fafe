import { Product, MarketplaceCategory } from '../types';

export const initialMarketplaceCategories: MarketplaceCategory[] = [
  {
    id: 'mode-textiles',
    name: 'Mode & Textiles Africains',
    slug: 'mode-textiles',
    description: 'Vêtements de créatrices, pagnes tissés d\'exception et accessoires en wax et bogolan.',
    isActive: true,
    order: 1,
    createdAt: 1700000000000,
    updatedAt: 1700000000000
  },
  {
    id: 'cosmetiques-naturels',
    name: 'Cosmétiques & Soins Naturels',
    slug: 'cosmetiques-soins-naturels',
    description: 'Trésors botaniques africains, beurres purs et huiles végétales de haute qualité.',
    isActive: true,
    order: 2,
    createdAt: 1700000000000,
    updatedAt: 1700000000000
  },
  {
    id: 'epicerie-saveurs',
    name: 'Épicerie Fine & Terroirs',
    slug: 'epicerie-fine-terroirs',
    description: 'Épices d\'origine protégée, cafés de spécialité, miels sauvages et tisanes d\'Afrique.',
    isActive: true,
    order: 3,
    createdAt: 1700000000000,
    updatedAt: 1700000000000
  },
  {
    id: 'artisanat-deco',
    name: 'Artisanat & Décoration',
    slug: 'artisanat-decoration',
    description: 'Objets décoratifs faits main, vannerie d\'art, poteries et sculptures uniques.',
    isActive: true,
    order: 4,
    createdAt: 1700000000000,
    updatedAt: 1700000000000
  },
  {
    id: 'bijoux-accessoires',
    name: 'Bijoux & Ornements',
    slug: 'bijoux-ornements',
    description: 'Parures contemporaines et créations traditionnelles en perles, laiton et argent.',
    isActive: true,
    order: 5,
    createdAt: 1700000000000,
    updatedAt: 1700000000000
  }
];

export const initialMarketplaceProducts: Product[] = [
  {
    id: 'prod-pagne-baoule',
    name: 'Pagne Tissé Traditionnel Baoulé',
    slug: 'pagne-tisse-traditionnel-baoule',
    shortDescription: 'Tissé artisanalement en Côte d\'Ivoire avec des fils de coton teints aux pigments naturels.',
    fullDescription: 'Ce pagne baoulé authentique est tissé à la main sur un métier traditionnel par des artisanes expertes. Ses motifs géométriques distinctifs et ses teintes vibrantes en font une pièce d\'exception pour les cérémonies comme pour la haute couture africaine.',
    price: 35000,
    promotionalPrice: 29500,
    currency: 'XAF',
    images: [
      'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1000&q=80'
    ],
    categoryId: 'mode-textiles',
    stock: 14,
    status: 'PUBLISHED',
    isFeatured: true,
    createdAt: 1710000000000,
    updatedAt: 1710000000000
  },
  {
    id: 'prod-karite-brut-bio',
    name: 'Beurre de Karité Brut Pur & Bio',
    slug: 'beurre-de-karite-brut-pur-bio',
    shortDescription: 'Extrait à froid au Burkina Faso par une coopérative de femmes. Nourrissant et réparateur.',
    fullDescription: 'Récolté et préparé selon les méthodes traditionnelles, ce beurre de karité 100% pur non raffiné conserve toutes ses vitamines A, E et F. Il nourrit intensément les peaux sèches, apaise le cuir chevelu et protège les longueurs capillaires.',
    price: 8500,
    currency: 'XAF',
    images: [
      'https://images.unsplash.com/photo-1608248597359-2ffb233a7585?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1000&q=80'
    ],
    categoryId: 'cosmetiques-naturels',
    stock: 45,
    status: 'PUBLISHED',
    isFeatured: true,
    createdAt: 1710100000000,
    updatedAt: 1710100000000
  },
  {
    id: 'prod-poivre-penja-igp',
    name: 'Poivre Blanc de Penja IGP Grand Cru',
    slug: 'poivre-blanc-de-penja-igp-grand-cru',
    shortDescription: 'Terroir volcanique du Cameroun, arômes boisés et mentholés d\'une rare finesse.',
    fullDescription: 'Le Poivre de Penja est la première Indication Géographique Protégée (IGP) d\'Afrique subsaharienne. Cultivé sur les flancs volcaniques fertiles du Mont Koupé, il est sélectionné baie par baie et séché délicatement au soleil pour révéler un bouquet aromatique puissant et élégant.',
    price: 12500,
    promotionalPrice: 10500,
    currency: 'XAF',
    images: [
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1000&q=80'
    ],
    categoryId: 'epicerie-saveurs',
    stock: 30,
    status: 'PUBLISHED',
    isFeatured: true,
    createdAt: 1710200000000,
    updatedAt: 1710200000000
  },
  {
    id: 'prod-panier-bolga',
    name: 'Panier Artisanal Bolga Tressé Main',
    slug: 'panier-artisanal-bolga-tresse-main',
    shortDescription: 'Tressé en paille veta vera durable avec anse ergonomique gainée de cuir naturel.',
    fullDescription: 'Confectionné par les tisseuses de Bolgatanga au nord du Ghana, ce panier cabas conjugue robustesse remarquable et design intemporel. Idéal pour vos courses, le marché ou comme élément décoratif chaleureux pour votre intérieur.',
    price: 24000,
    currency: 'XAF',
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80'
    ],
    categoryId: 'artisanat-deco',
    stock: 12,
    status: 'PUBLISHED',
    isFeatured: false,
    createdAt: 1710300000000,
    updatedAt: 1710300000000
  },
  {
    id: 'prod-plastron-perles-masai',
    name: 'Collier Plastron en Perles de Verre Masai',
    slug: 'collier-plastron-en-perles-de-verre-masai',
    shortDescription: 'Bijou sculptural tissé à la main au Kenya aux couleurs symboliques de la terre et du courage.',
    fullDescription: 'Chaque rang de ce somptueux plastron est tissé méticuleusement avec des micro-perles de verre traditionnelles. Une pièce maîtresse qui sublime les tenues habillées comme les styles contemporains épurés.',
    price: 19500,
    currency: 'XAF',
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80'
    ],
    categoryId: 'bijoux-accessoires',
    stock: 16,
    status: 'PUBLISHED',
    isFeatured: true,
    createdAt: 1710400000000,
    updatedAt: 1710400000000
  },
  {
    id: 'prod-huile-moringa-pure',
    name: 'Huile Végétale de Moringa Pressée à Froid',
    slug: 'huile-vegetale-de-moringa-pressee-a-froid',
    shortDescription: 'Élixir anti-oxydant naturel cultivé de manière éthique au Sénégal.',
    fullDescription: 'Riche en acides oléiques et en antioxydants rares, l\'huile de graines de moringa pénètre rapidement sans laisser de film gras. Elle unifie le teint, régénère l\'épiderme et redonne éclat et souplesse aux cheveux ternes.',
    price: 14500,
    currency: 'XAF',
    images: [
      'https://images.unsplash.com/photo-1608248597359-2ffb233a7585?auto=format&fit=crop&w=1000&q=80'
    ],
    categoryId: 'cosmetiques-naturels',
    stock: 28,
    status: 'PUBLISHED',
    isFeatured: false,
    createdAt: 1710500000000,
    updatedAt: 1710500000000
  },
  {
    id: 'prod-cafe-arabica-hauts-plateaux',
    name: 'Café Arabica des Hauts Plateaux',
    slug: 'cafe-arabica-des-hauts-plateaux',
    shortDescription: 'Torréfaction artisanale moyenne, notes gourmandes de cacao noir et agrumes confits.',
    fullDescription: 'Issu de parcelles d\'altitude conduites en agroforesterie par des productrices indépendantes, ce café de spécialité offre une tasse soyeuse, équilibrée et suave avec une finale fruitée persistante.',
    price: 9000,
    currency: 'XAF',
    images: [
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=1000&q=80'
    ],
    categoryId: 'epicerie-saveurs',
    stock: 35,
    status: 'PUBLISHED',
    isFeatured: false,
    createdAt: 1710600000000,
    updatedAt: 1710600000000
  },
  {
    id: 'prod-chemisier-wax-bogolan',
    name: 'Veste Kimono en Tissu Bogolan Moderne',
    slug: 'veste-kimono-en-tissu-bogolan-moderne',
    shortDescription: 'Teinture traditionnelle à base d\'argile et plantes médicinales du Mali. Coupe moderne.',
    fullDescription: 'Créée par de jeunes stylistes de notre réseau FAFE, cette veste kimono associe l\'art ancestral de la teinture à la boue fermentée du Mali à une coupe fluide contemporaine pour une allure distinguée et engagée.',
    price: 45000,
    promotionalPrice: 39000,
    currency: 'XAF',
    images: [
      'https://images.unsplash.com/photo-1549439602-43ebca2327af?auto=format&fit=crop&w=1000&q=80'
    ],
    categoryId: 'mode-textiles',
    stock: 7,
    status: 'PUBLISHED',
    isFeatured: true,
    createdAt: 1710700000000,
    updatedAt: 1710700000000
  }
];
