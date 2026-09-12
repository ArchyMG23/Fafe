import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";

// On utilise les variables d'environnement de l'espace de travail
const firebaseConfig = {
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  appId: process.env.VITE_FIREBASE_APP_ID,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function runTest() {
  console.log("🔄 Début du test de connexion Firestore...");
  const docRef = doc(db, "test_connection", "verification_doc");
  
  try {
    // 1. Écriture
    console.log("⏳ Écriture du document de test...");
    await setDoc(docRef, { status: "success", timestamp: new Date().toISOString() });
    console.log("✅ [Succès] Document écrit.");

    // 2. Lecture
    console.log("⏳ Lecture du document...");
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data().status === "success") {
      console.log("✅ [Succès] Document lu et vérifié :", snap.data());
    } else {
      throw new Error("Le document n'existe pas ou les données sont incorrectes.");
    }

    // 3. Suppression
    console.log("⏳ Suppression du document de test...");
    await deleteDoc(docRef);
    console.log("✅ [Succès] Document supprimé. Base propre.");

    console.log("🎉 TEST VALIDÉ : Firestore est 100% opérationnel !");
  } catch (error) {
    console.error("❌ [Échec] Erreur lors du test Firestore :", error.message);
  }
  
  setTimeout(() => process.exit(0), 1000);
}

runTest();
