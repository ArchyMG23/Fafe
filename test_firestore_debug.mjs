import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";

const config = {
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  appId: process.env.VITE_FIREBASE_APP_ID,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
};

const app = initializeApp(config);
const db = getFirestore(app);

async function testCollection(domain, path) {
  const docRef = doc(db, path);
  try {
    await setDoc(docRef, { test: true, timestamp: Date.now(), domain });
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data().domain === domain) {
      console.log(`✅ [OK] ${domain} - Écriture et lecture réussies sur la collection '${path.split('/')[0]}'`);
      await deleteDoc(docRef);
      return true;
    } else {
      console.log(`❌ [FAIL] ${domain} - Données manquantes ou incorrectes sur '${path}'`);
      return false;
    }
  } catch (e) {
    console.log(`❌ [FAIL] ${domain} - Erreur: ${e.message}`);
    return false;
  }
}

async function runTests() {
  console.log("Démarrage des tests de persistance Cloud Firestore...");
  
  const results = [];
  results.push(await testCollection("CMS", "cms_pages/system_test_123"));
  results.push(await testCollection("Branding", "siteSettings/system_test_123"));
  results.push(await testCollection("Profil utilisateur", "users/system_test_123"));
  results.push(await testCollection("Marketplace", "products/system_test_123"));
  results.push(await testCollection("Commandes", "orders/system_test_123"));
  
  if (results.some(r => !r)) {
     console.log("\n⚠️ Certains tests ont échoué. La connexion à la base de données n'est pas opérationnelle.");
  } else {
     console.log("\n✅ Tous les tests sont terminés avec succès.");
  }
  process.exit(0);
}

// Timeout to prevent hanging if DB doesn't exist (Firestore SDK retries infinitely)
setTimeout(() => {
  console.log("\n❌ [TIMEOUT] Impossible de se connecter à la base de données. Le SDK tourne dans le vide car la base '(default)' n'existe pas ou est inaccessible.");
  process.exit(1);
}, 6000);

runTests();
