import { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';

export function DiagnosticFirestore() {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const runDiagnostic = async () => {
    setLoading(true);
    setResults([]);
    const steps: string[] = [];

    const addLog = (msg: string) => {
        steps.push(msg);
        setResults([...steps]);
    };

    try {
      // a. Lecture collection users
      addLog('a. Lecture collection "users"...');
      const usersSnap = await getDocs(collection(db, 'users'));
      addLog(`Succès: ${usersSnap.size} documents trouvés dans "users".`);
    } catch (e: any) {
      addLog(`Échec a: ${e.code} - ${e.message}`);
    }

    try {
      // b. Écriture
      addLog('b. Écriture dans "_healthcheck/test"...');
      await setDoc(doc(db, '_healthcheck', 'test'), { timestamp: Date.now() });
      addLog('Succès: Document écrit.');
    } catch (e: any) {
      addLog(`Échec b: ${e.code} - ${e.message}`);
    }

    try {
      // c. Relecture
      addLog('c. Relecture de "_healthcheck/test"...');
      const docSnap = await getDoc(doc(db, '_healthcheck', 'test'));
      if (docSnap.exists()) {
        addLog('Succès: Document lu.');
      } else {
        addLog('Échec c: Document non trouvé.');
      }
    } catch (e: any) {
      addLog(`Échec c: ${e.code} - ${e.message}`);
    }

    setLoading(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Diagnostic Firestore</h1>
      <button 
        onClick={runDiagnostic} 
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        {loading ? 'Diagnostic en cours...' : 'Lancer le diagnostic'}
      </button>
      <pre className="bg-gray-100 p-4 rounded text-sm whitespace-pre-wrap">
        {results.join('\n')}
      </pre>
    </div>
  );
}
