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
