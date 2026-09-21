
import { publishCMSPage } from '../lib/cms';

async function forceUpdate() {
    const heroContent = {
        hero: {
            heroImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80",
            title: { fr: "Excellence au féminin pour l'Afrique", en: "Female Excellence for Africa" },
            shortText: { fr: "Accompagner, financer et valoriser les projets portés par des femmes à travers le continent.", en: "Supporting and empowering women-led initiatives across the continent." },
            buttonText: { fr: "Rejoindre le réseau", en: "Join the network" },
            buttonLink: "/rejoindre"
        }
    };

    try {
        await publishCMSPage('accueil', heroContent, { id: 'admin', name: 'Admin', email: 'admin@fafe.org' });
        console.log('Hero updated successfully!');
    } catch (e) {
        console.error('Update failed:', e);
    }
}

forceUpdate();
